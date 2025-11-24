import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { 
  NavController,
  IonContent, 
  IonHeader, 
  IonInput, 
  IonLabel, 
  IonInputPasswordToggle, 
  IonSpinner,
  IonCardContent, 
  IonButton, 
  IonImg, 
  IonText 
} from '@ionic/angular/standalone';


@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, CommonModule, FormsModule, IonInput, IonLabel, IonInputPasswordToggle, IonCardContent, IonButton, IonImg, IonText, IonSpinner]
})


export class CadastroPage implements OnInit {
  nome: string = '';
  email: string = '';
  senha: string = '';
  confirm: string = '';
  cep: string = '';
  dados: any = null;
  errorMessage: string = '';
  sucessMessage: string = '';
  error = '';
  debugMessage: string = '';
  isLoading = false;

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private navCtrl = inject(NavController);

  constructor() { }

  private translateError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return '*Este e-mail já está cadastrado. Tente fazer login ou redefinir a senha.';
      case 'auth/invalid-email':
        return '*O formato do e-mail é inválido.';
      case 'auth/weak-password':
        return '*A senha é muito fraca. Escolha uma senha mais forte.';
      default:
        console.error('Erro de Cadastro não mapeado:', errorCode);
        return '*Ocorreu um erro desconhecido durante o cadastro.';
    }
  }

  resetResponse() {
    this.errorMessage = '';
    this.dados = null;
  }

  onCepInput(event: any) {
    this.resetResponse();
    const digits = ((event?.target?.value ?? '') as string).replace(/\D/g, '').substring(0, 8);
    this.cep = digits.replace(/^(\d{5})(\d{0,3})$/, (_m, g1, g2) => g2 ? `${g1}-${g2}` : g1);
  }

  // retorna true se consulta OK e popula this.dados, caso contrário false e seta errorMessage
  async consultarCep(): Promise<boolean> {
    this.resetResponse();
    const cepDigits = (this.cep || '').replace(/\D/g, '');
    if (!cepDigits || cepDigits.length !== 8) {
      this.errorMessage = '*Por favor, insira um CEP válido com 8 dígitos.';
      return false;
    }
    if (!navigator.onLine) {
      this.errorMessage = 'Sem conexão de rede. Verifique sua internet.';
      return false;
    }
    try {
      const url = `https://viacep.com.br/ws/${cepDigits}/json/`;
      const response = await fetch(url);
      if (!response.ok) {
        this.errorMessage = `Erro na consulta (status ${response.status}).`;
        console.error('Fetch response não ok', response);
        return false;
      }
      const json = await response.json();
      if (json.erro) {
        this.errorMessage = 'CEP não encontrado.';
        return false;
      }
      this.dados = json;
      this.sucessMessage = 'CEP encontrado com sucesso!';
      return true;
    } catch (error: any) {
      console.error('Erro ao chamar API viacep:', error);
      if (error?.message?.includes('Failed to fetch')) {
        this.errorMessage = 'Falha de rede ou bloqueio CORS. Verifique console/network ou use um proxy.';
      } else {
        this.errorMessage = error instanceof Error ? error.message : 'Erro desconhecido.';
      }
      return false;
    }
  }

  private isValidCep(cep: string): boolean {
    const digits = (cep || '').replace(/\D/g, '');
    return digits.length === 8;
  }

  private async showToast(message: string, color: 'danger'|'success'|'warning' = 'danger', duration = 3500) {
    try {
      const t = await this.toastCtrl.create({ message, color, duration, position: 'top' });
      await t.present();
    } catch (err) {
      console.warn('Toast falhou:', err);
    }
  }

  private async setUserError(message: string) {
    this.errorMessage = message; // Exibe no HTML
    this.isLoading = false;
    this.debugMessage = message;
    await this.showToast(message, 'danger'); // Exibe no Toast
  }

  private async setUserSuccess(message: string) {
    this.errorMessage = ''; // Limpa erro anterior
    
    try {
      const alert = await this.alertCtrl.create({
        header: 'Sucesso!',
        message: message,
        buttons: [{
          text: 'OK',
          handler: () => {
            this.navCtrl.navigateRoot('/login');
          }
        }]
      });

      this.isLoading = false;
      this.debugMessage = message;
      await alert.present();
    } catch (e) {
      console.error('Erro ao exibir alerta de sucesso:', e);
      // Fallback: redireciona mesmo se o alerta falhar
      this.isLoading = false;
      this.debugMessage = 'Alerta falhou; redirecionando...';
      this.navCtrl.navigateRoot('/login');
    }
  }

  async register() {
    console.log('Iniciando cadastro...');
    this.isLoading = true;
    this.debugMessage = 'Iniciando cadastro...';
    this.errorMessage = ''; // Limpa erros ao tentar novamente
    this.error = '';

    // Verifica campos vazios
    if (!this.nome || !this.email || !this.senha || !this.cep || !this.confirm) {
      await this.setUserError('Por favor, preencha todos os campos.');
      return;
    }

    // Validação Nome
    if (this.nome.trim().length < 4) {
      await this.setUserError('Nome não pode possuir menos de 4 letras.');
      return;
    }

    // Validação Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      await this.setUserError('Email inválido ou não existe.');
      return;
    }

    // Validação CEP (Formato)
    if (!this.isValidCep(this.cep)) {
      await this.setUserError('CEP inválido.');
      return;
    }

    // Validação CEP (API)
    const cepOk = await this.consultarCep();
    if (!cepOk) {
      await this.setUserError('CEP inválido.');
      return;
    }

    // Validação Senha
    if (this.senha.length < 5) {
      await this.setUserError('Senha não pode possuir menos de 5 letras.');
      return;
    }

    // Validação Confirmação Senha
    if (this.senha !== this.confirm) {
      await this.setUserError('Senhas não são iguais.');
      return;
    }

    try {
      console.log('Chamando createUserWithEmailAndPassword');
      this.debugMessage = 'Criando conta...';
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.senha);
      const user = userCredential.user;

      if (user) {
        // Tenta atualizar o perfil (Nome)
        try {
          console.log('Atualizando displayName...');
          this.debugMessage = 'Atualizando perfil...';
          await updateProfile(user, { displayName: this.nome });
        } catch (profileErr) {
          console.warn('Erro ao atualizar nome do perfil:', profileErr);
        }

        // Salvar dados adicionais no Firestore
        try {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          await setDoc(userDocRef, {
            nome: this.nome,
            email: this.email,
            cep: this.cep,
            role: 'user' // Default role
          });
        } catch (firestoreError) {
          console.error('Erro ao salvar dados no Firestore:', firestoreError);
          // Não bloqueia o fluxo de sucesso do cadastro
        }

        try {
          if (typeof user.reload === 'function') {
            await user.reload();
          } else if (this.auth.currentUser && typeof this.auth.currentUser.reload === 'function') {
            await this.auth.currentUser.reload();
          }
        } catch (reloadErr) {
          console.warn('Falha ao recarregar usuário após updateProfile:', reloadErr);
        }
      }

      console.log('Cadastro realizado com sucesso, exibindo alerta...');
      this.debugMessage = 'Cadastro realizado com sucesso.';
      await this.setUserSuccess('Cadastro concluído com sucesso!');

    } catch (e: any) {
      console.error('Erro no registro:', e);
      const errorCode = e?.code || null;
      if (errorCode) {
        await this.setUserError(this.translateError(errorCode));
      } else {
        console.error('Register error raw:', e);
        await this.setUserError('Ocorreu um erro ao criar a conta. Tente novamente mais tarde.');
      }
    } finally {
      // Garante que o indicador seja desligado caso as funções acima não o façam
      this.isLoading = false;
    }
  }

  goLogin() {
    this.navCtrl.navigateRoot('/login');
  }

  ngOnInit() { }

}