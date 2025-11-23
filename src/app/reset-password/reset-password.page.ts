import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonButton,
  IonInput,
  IonCardContent,
  IonLabel,
  IonFab,
  IonFabButton,
  IonIcon,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';

import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    // Ionic standalone components
    IonContent,
    IonHeader,
    IonInput,
    IonButton,
    IonCardContent,
    IonLabel,
    IonFab,
    IonFabButton,
    IonIcon,

    RouterLink,
  ]
})
export class ResetPasswordPage implements OnInit {

  email: string = '';

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
  ) {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {}

  async handlePasswordReset() {

    if (!this.email.trim()) {
      this.showAlert('Atenção', 'Digite seu e-mail.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Enviando...',
      spinner: 'crescent'
    });

    await loading.present();

    try {
      await this.authService.resetPassword(this.email.trim());

      await loading.dismiss();
      await this.showAlert(
        'Verifique seu e-mail',
        `Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha. Não se esqueça de verificar também a sua caixa de Spam ou Lixeira.`
      );

    } catch (err) {
      console.error(err);

      await loading.dismiss();

      await this.showAlert(
        'Erro ao enviar link',
        'Verifique o endereço de e-mail e tente novamente.'
      );
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
