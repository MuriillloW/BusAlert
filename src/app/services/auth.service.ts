import { Injectable, inject } from '@angular/core';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { sendEmailVerification } from 'firebase/auth';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth: Auth = inject(Auth);

  constructor() { 
    console.log('AuthService constructor -> auth instance:', this.auth);
  }

  /**
   * @doc Solicita envio de um e-mail de redefinição de senha.
   * @param email O e-mail do usuário que solicitou a redefinição.
   * @returns Uma Promise que resolve quando o e-mail é enviado com sucesso.
   */
  async resetPassword(email: string): Promise<void> {
    try {
      // 1. Chamada à função do Firebase para enviar o e-mail
      await sendPasswordResetEmail(this.auth, email);
      console.log('E-mail de redefinição enviado com sucesso para:', email);

    } catch (error: any) {
      console.error('Erro ao enviar e-mail de redefinição:', error);
      throw error; 
    }
  }

  /**
   * Gera um código 2FA, armazena temporariamente e simula envio por email.
   * @param email Email do usuário autenticado
   */
  async send2faCode(email: string): Promise<void> {
    // Gera código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Envia o código por email usando EmailJS
    const serviceID = 'service_icsdx58';
    const templateID = 'template_zfpiuah';
    const publicKey = '9PV2sRK2TfX9f7buF';
    const templateParams = {
      to_email: email,
      code: code
    };
    try {
      console.log('Enviando email 2FA:', { serviceID, templateID, publicKey, templateParams });
      await emailjs.send(serviceID, templateID, templateParams, publicKey);
      // Só salva o código se o envio foi bem-sucedido
      localStorage.setItem('2fa_code', code);
      localStorage.setItem('2fa_email', email);
      localStorage.setItem('2fa_expiry', (Date.now() + 5 * 60 * 1000).toString()); // 5 min
      console.log('Código 2FA enviado para o email:', email);
    } catch (err: any) {
      if (err && typeof err === 'object') {
        console.error('Erro ao enviar código 2FA por email:', JSON.stringify(err));
        alert('Erro ao enviar código por email: ' + (err.text || JSON.stringify(err)));
      } else {
        console.error('Erro ao enviar código 2FA por email:', err);
        alert('Erro ao enviar código por email: ' + err);
      }
      throw new Error('Erro ao enviar código por email. Tente novamente. Detalhe: ' + (err?.text || JSON.stringify(err)));
    }
  }

  /**
   * Verifica o código 2FA informado pelo usuário.
   * @param code Código informado
   * @param saveDevice Se deve salvar o dispositivo como confiável
   */
  async verify2faCode(code: string, saveDevice: boolean): Promise<void> {
    const storedCode = localStorage.getItem('2fa_code');
    const expiry = Number(localStorage.getItem('2fa_expiry'));
    if (!storedCode || Date.now() > expiry) {
      throw new Error('Código expirado. Solicite um novo login.');
    }
    if (code !== storedCode) {
      throw new Error('Código inválido.');
    }
    // Limpa código após uso
    localStorage.removeItem('2fa_code');
    localStorage.removeItem('2fa_expiry');
    if (saveDevice) {
      localStorage.setItem('2fa_trusted', 'true');
    }
  }

  /**
   * Verifica se o dispositivo é confiável (pular 2FA)
   */
  isTrustedDevice(): boolean {
    return localStorage.getItem('2fa_trusted') === 'true';
  }
  
}
