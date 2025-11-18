import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Router, RouterLink } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { IonContent, IonHeader, IonInput, IonLabel, IonInputPasswordToggle, IonCardContent, IonButton, IonImg} from '@ionic/angular/standalone';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, CommonModule, FormsModule, IonInput, IonLabel, IonInputPasswordToggle, IonCardContent, IonButton, IonImg]
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

  private auth = inject(Auth);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

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
    // this.error = message;
    // await this.showToast(message, 'danger');
    // setTimeout(() => { this.error = ''; }, 5000);

    await this.showToast(message, 'danger');
  }

  private async setUserSuccess(message: string) {
    // this.sucessMessage = message;
    await this.showToast(message, 'success');
    setTimeout(() => { this.sucessMessage = ''; }, 4000);
  }

  async register() {
    this.error = '';

    if (!this.nome || !this.email || !this.senha || !this.cep) {
      await this.setUserError('*Por favor, preencha todos os campos para continuar.');
      return;
    }

    if (!this.nome.trim()) {
      await this.setUserError('*Preencha o nome.');
      return;
    }

    if (!this.isValidCep(this.cep)) {
      await this.setUserError('*CEP inválido. Informe 8 dígitos.');
      return;
    }

    // opcional: validar CEP via API antes de criar conta
    const cepOk = await this.consultarCep();
    if (!cepOk) {
      await this.setUserError(this.errorMessage || '*CEP inválido ou não encontrado.');
      return;
    }

    if (this.senha.length < 8) {
      await this.setUserError('*A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    if (this.senha !== this.confirm) {
      await this.setUserError('*As senhas não coincidem. Por favor , verifique.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.senha);
      const user = userCredential.user;

      if (user) {
        await updateProfile(user, { displayName: this.nome });

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

      await this.setUserSuccess('Cadastro concluído. Redirecionando...');
      await this.router.navigateByUrl('/home', { replaceUrl: true });

    } catch (e: any) {
      const errorCode = e?.code || null;
      if (errorCode) {
        await this.setUserError(this.translateError(errorCode));
      } else {
        console.error('Register error raw:', e);
        await this.setUserError('Ocorreu um erro ao criar a conta. Tente novamente mais tarde.');
      }
    }
  }

  ngOnInit() { }
}