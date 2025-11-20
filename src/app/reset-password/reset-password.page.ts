import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular'; // Para feedback visual
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton, IonItem, IonInput, IonCardContent, IonLabel, IonFab, IonFabButton, IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

import { addIcons } from 'ionicons';
import { add, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonButtons, IonBackButton, IonItem, IonInput, RouterLink, IonCardContent, IonLabel, IonFab, IonFabButton, IonIcon]
})
export class ResetPasswordPage implements OnInit {

  // Variável para armazenar o e-mail digitado pelo usuário
  email: string = '';

  constructor(
    private authService: AuthService,
    private alertController: AlertController, // Para mostrar mensagens de sucesso/erro
    private loadingController: LoadingController // Para mostrar um indicador de carregamento
  ) {

    addIcons({ add, arrowBackOutline });

  }

  /**
   * @doc Lida com o clique do botão para iniciar o processo de redefinição de senha.
   */
  async handlePasswordReset() {
    // 1. Mostrar um indicador de carregamento
    const loading = await this.loadingController.create({
      message: 'Enviando e-mail...',
    });
    await loading.present();

    try {
      // 2. Chamar o método do serviço
      await this.authService.resetPassword(this.email);

      // 3. Sucesso: Mostrar alerta
      await this.presentAlert(
        'Sucesso!', 
        `Um e-mail de redefinição foi enviado para ${this.email}. Verifique sua caixa de entrada e spam.`
      );
      
      // Limpar o campo ou navegar para a tela de login, se desejar.

    } catch (error: any) {
      // 4. Erro: Mostrar alerta
      let errorMessage = 'Ocorreu um erro ao tentar enviar o link.';
      
      // Exemplo de tratamento de erro específico do Firebase
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Nenhuma conta encontrada com este e-mail.';
      }

      await this.presentAlert('Erro', errorMessage);
      
    } finally {
      // 5. Esconder o indicador de carregamento
      await loading.dismiss();
    }
  }

  /**
   * @doc Função auxiliar para mostrar um alerta.
   */
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
  
  

  ngOnInit() {
  }

  
  
}
