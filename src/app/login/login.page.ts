import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';

import {
  IonContent,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonCardHeader,
  IonText
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  imports: [
    IonContent,
    IonInput,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    FormsModule,
    RouterLink,
    IonText
  ],
})
export class LoginPage {
  private auth = inject(Auth);
  private router = inject(Router);
  private authService = inject(AuthService);
  error = '';

  email: string = '';
  senha: string = '';

  // Função ara tradução dos códigos de erro
  private translateFirebaseError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'O formato do e-mail está incorreto.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Credenciais inválidas. E-mail ou senha incorretos.';
      case 'auth/user-disabled':
        return 'Esta conta foi desativada. Entre em contato com o suporte.';
      case 'auth/too-many-requests':
        return 'Acesso temporariamente bloqueado devido a muitas tentativas. Tente novamente mais tarde.';
      default:
        // Mensagem padrão para erros não mapeados
        console.error('Erro de Autenticação não mapeado:', errorCode);
        return 'Ocorreu um erro desconhecido. Tente novamente.';
    }
  }

  

  async loginEmail() {
    this.error = '';
    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.senha);
      // Verifica se o dispositivo é confiável
      if (this.authService.isTrustedDevice()) {
        await this.router.navigateByUrl('/home', { replaceUrl: true });
        return;
      }
      // Envia código 2FA para o email
      await this.authService.send2faCode(this.email);
      await this.router.navigateByUrl('/verify', { replaceUrl: true });
    } catch (e: any) {
      // Se for erro do 2FA/emailjs, mostra a mensagem real
      if (e?.message) {
        this.error = e.message;
        return;
      }
      // Pega o código do erro (ou um fallback)
      const errorCode = e?.code || 'auth/unknown-error';
      // 1. Traduz o código do erro para português
      const translatedMessage = this.translateFirebaseError(errorCode);
      // 2. Define a variável 'error' que o HTML irá exibir
      this.error = translatedMessage;
    }
  }


  // email = '';
  // password = '';

  // constructor() {}

  // onSubmit() {
  //   // Placeholder: implementar autenticação
  //   console.log('login', this.email, this.password);
  // }

  // onRegister() {
  //   // navegar para cadastro se necessário
  //   console.log('register');
  // }
}
