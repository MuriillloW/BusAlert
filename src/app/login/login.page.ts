import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToolbar,
  IonHeader,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonCard, 
  IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonToolbar,
    IonHeader,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonCard,
    IonIcon,
    FormsModule]
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
