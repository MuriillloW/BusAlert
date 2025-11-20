import { Injectable } from '@angular/core';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) { }

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
  
}
