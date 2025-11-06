import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

import { Router, RouterLink } from '@angular/router';

import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonList, IonLabel, IonItem, IonInputPasswordToggle, IonCard, IonCardHeader, IonCardContent, IonButton, IonImg, IonText} from '@ionic/angular/standalone';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonInput, IonList, IonLabel, IonItem, IonInputPasswordToggle, IonCard, IonCardHeader, IonCardContent, IonButton, IonImg, IonText, RouterLink]
})
export class CadastroPage implements OnInit {
  // Campo de casdastro
  nome: string = '';
  email: string = '';
  senha: string = '';
  confirm: string = '';




  cep: string = '';
  dados: any = null;
  errorMessage: string = '';
  sucessMessage: string = '';

  // Controle de erro de cadastro
  error = '';

  private auth = inject(Auth);
  private router = inject(Router);

  constructor() { }




  // Validação CEP com formatação
  resetResponse() {
    this.errorMessage = '';
    this.dados = null;
  }

  onCepInput(event: any) {
   this.resetResponse();
    const digits = ((event?.target?.value ?? '') as string).replace(/\D/g, '').substring(0, 8);
   this.cep = digits.replace(/^(\d{5})(\d{0,3})$/, (_m, g1, g2) => g2 ? `${g1}-${g2}` : g1);
  }

  async consultarCep() {
    this.resetResponse(); // Reseta a resposta antes de consultar

    // remove tudo que não for dígito
    const cepDigits = (this.cep || '').replace(/\D/g, '');

    if (!cepDigits || cepDigits.length !== 8) {
      this.errorMessage = '*Por favor, insira um CEP válido com 8 dígitos.';
      return;
    }

    if (!navigator.onLine) {
      this.errorMessage = 'Sem conexão de rede. Verifique sua internet.';
      return;
    }

    try {
      const url = `https://viacep.com.br/ws/${cepDigits}/json/`;
      console.log('Consultando CEP:', url);
      const response = await fetch(url);
      if (!response.ok) {
        this.errorMessage = `Erro na consulta (status ${response.status}).`;
        console.error('Fetch response não ok', response);
        return;
      }
      const json = await response.json();
      if (json.erro) {
        this.errorMessage = 'CEP não encontrado.';
        return;
      }
      this.sucessMessage = 'CEP encontrado com sucesso!';
    } catch (error: any) {
      console.error('Erro ao chamar API viacep:', error);
      // mensagem mais clara para falhas de rede/CORS
      if (error?.message?.includes('Failed to fetch')) {
        this.errorMessage = 'Falha de rede ou bloqueio CORS. Verifique console/network ou use um proxy.';
      } else {
        this.errorMessage = error instanceof Error ? error.message : 'Erro desconhecido.';
      }
    }
  }


  // Cadastro Firebase

  async register() {
    this.error = '';

    if ( !this.nome || !this.email || !this.senha) { 
      this.error = '*Preencha todos os campos.';
      return; }

    if (this.senha.length < 8) { 
      this.error = '*A senha precisa ter pelo menos 8 caracteres.';
      return; }

    if (this.senha !== this.confirm) { 
      this.error = '*As senhas não conferem.'; 
      return; }

    try {
      await createUserWithEmailAndPassword(this.auth, this.email, this.senha);
      await this.router.navigateByUrl('/home'); // já entra autenticado
    } catch (e: any) {
      this.error = e?.code ?? 'Falha ao cadastrar';
    }
  }


  ngOnInit() {
    
  }

  

}