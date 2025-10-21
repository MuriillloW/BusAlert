import { Component } from '@angular/core';
import {
  IonContent,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonCardHeader,
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
  ],
})
export class LoginPage {
  email = '';
  password = '';

  constructor() {}

  onSubmit() {
    // Placeholder: implementar autenticação
    console.log('login', this.email, this.password);
  }

  onRegister() {
    // navegar para cadastro se necessário
    console.log('register');
  }
}
