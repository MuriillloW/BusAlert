import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
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
