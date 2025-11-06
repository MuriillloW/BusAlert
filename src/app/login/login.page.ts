import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

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
  error = '';

  email: string = '';
  senha: string = '';

  async loginEmail() {
    this.error = '';
    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.senha);
      await this.router.navigateByUrl('/home');
    } catch (e: any) {
      this.error = e?.code ?? 'Falha ao autenticar (email/senha)';
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
