import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular'; // Para feedback visual
import { IonContent, IonHeader, IonButton, IonInput, IonCardContent, IonLabel, IonFab, IonFabButton, IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

import { addIcons } from 'ionicons';
import { add, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, CommonModule, FormsModule, IonButton, IonInput, RouterLink, IonCardContent, IonLabel, IonFab, IonFabButton, IonIcon]
})
export class ResetPasswordPage implements OnInit {

  // Variável para armazenar o e-mail digitado pelo usuário
  email: string = '';

  constructor(
    private authService: AuthService,
    private alertController: AlertController, // Para mostrar mensagens de sucesso/erro
    private loadingController: LoadingController, // Para mostrar um indicador de carregamento
    private zone: NgZone // Para garantir a execução correta no Android
  ) {

    addIcons({ add, arrowBackOutline });

  }

  /**
   * @doc Lida com o clique do botão para iniciar o processo de redefinição de senha.
   */
  async handlePasswordReset() {
    console.log('Iniciando reset de senha para:', this.email); // Log para debug

    // Validação básica
    if (!this.email || !this.email.trim()) {
      try { await this.presentAlert('Atenção', 'Por favor, digite seu e-mail.'); } catch (e) { console.error('Falha ao mostrar alerta', e); }
      return;
    }

    const emailToSend = this.email.trim();

    // Envolve a lógica em NgZone para garantir a detecção de mudanças no Android
    this.zone.run(async () => {
      // 1. Mostrar um indicador de carregamento
      let loading: any = null;
      try {
        loading = await this.loadingController.create({ message: 'Enviando e-mail...', spinner: 'crescent' });
        try { await loading.present(); } catch (e) { console.warn('loading.present falhou', e); }
      } catch (e) {
        console.warn('Não foi possível criar indicador de carregamento', e);
        loading = null;
      }

      try {
        // 2. Chamar o método do serviço
        console.log('Chamando authService.resetPassword para', emailToSend);
        await this.authService.resetPassword(emailToSend);

        // 3. Sucesso: fechar loading (se existir) e mostrar alerta
        if (loading) {
          try { await loading.dismiss(); } catch (e) { console.warn('Falha ao dismiss loading', e); }
        }

        
        await new Promise(resolve => setTimeout(resolve, 150));

        try {
          await this.presentAlert('Verifique seu E-mail', `Se o e-mail ${emailToSend} estiver cadastrado, você receberá um link para redefinir sua senha. Verifique também a caixa de Spam.`);
        } catch (e) {
          console.error('Falha ao mostrar alerta de sucesso', e);
        }

      } catch (error: any) {
        console.error('Erro Reset Senha:', error);

        // Garantir que o loading seja fechado
        if (loading) {
          try { await loading.dismiss(); } catch (e) { console.warn('Falha ao dismiss loading no catch', e); }
        }

        await new Promise(resolve => setTimeout(resolve, 150));

        // 4. Erro: Mostrar alerta com mensagem amigável
        let errorMessage = 'Ocorreu um erro ao tentar enviar o link.';
        try {
          if (error?.code === 'auth/user-not-found') {
            errorMessage = 'Nenhuma conta encontrada com este e-mail.';
          } else if (error?.code === 'auth/invalid-email') {
            errorMessage = 'O formato do e-mail é inválido.';
          } else if (error?.message) {
            errorMessage += ` (Erro: ${error.message})`;
          } else if (typeof error === 'string') {
            errorMessage += ` (Erro: ${error})`;
          }
        } catch (e) {
          console.error('Erro ao processar mensagem de erro', e);
        }

        try { await this.presentAlert('Erro', errorMessage); } catch (e) { console.error('Falha ao mostrar alerta de erro', e); }

      }
    });
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
