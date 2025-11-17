import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonModal, IonInput, IonItem, IonLabel, ActionSheetController, IonTab, IonTabs, IonTabBar, IonTabButton, AlertController, IonToggle  } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, star, close, createOutline, sunny, moon, cameraReverseOutline } from 'ionicons/icons'
import { Auth, authState, signOut, User, user, updateProfile, updateEmail } from '@angular/fire/auth';
import { ThemeService } from 'src/app/services/theme.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, 
    IonFooter, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, 
    IonCardTitle, IonCardSubtitle, IonCardContent, IonModal, IonInput, 
    IonItem, IonLabel, IonToggle
  ]
})

export class UserPage implements OnInit {
  
  
  private auth: Auth = inject(Auth);
  private router = inject(Router);
  // Injeção do NavController para navegação entre páginas
  private navCtrl = inject(NavController);
  private sub?: Subscription;
  // ⬅️ NOVO: Injeção do AlertController
  private alertController = inject(AlertController);
  
  
  email: string | null = null;
  
  
  // ⬅️ NOVO: Variável para o objeto User do Firebase e Subscription
  currentUser: User | null = null;
  private userSubscription: Subscription | undefined;
  
  
  isModalOpen = false;
  // URL/base64 da imagem de perfil (usa ícone padrão se não houver salvo)
  profileImage: string = '../../assets/icon/avatar.png';
  // ⬅️ ALTERADO: Inicialização simples para ser substituída pelo Firebase no ngOnInit
  user: { name: string; email: string } = { name: 'Carregando...', email: 'Carregando...' };
  editUser: { name: string; email: string } = { ...this.user };
  notificationsEnabled: boolean = true;
  
  
  // Propriedades para o sistema de tema (usa o ThemeService real)
  themeIcon: string = 'sunny';
  private themeService = inject(ThemeService);
  
  // ⬅️ ALTERADO: Substituída a função ngOnInit para carregar os dados do Firebase
  closeModal() {
    this.isModalOpen = false;
  }
  ngOnInit() {
    { 
      addIcons({ home, person, star, close, createOutline, moon, sunny, cameraReverseOutline });
    }
    {
    }
    this.userSubscription = user(this.auth).subscribe(u => {
      this.currentUser = u;
      if (u) {
        this.user.name = u.displayName || 'Usuário Sem Nome';
        this.user.email = u.email || 'E-mail não disponível';
        this.editUser = { ...this.user }; // Preenche a modal de edição
      }
    });
    // Carrega imagem de perfil salva no localStorage, se existir
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      this.profileImage = savedImage;
    }
    // Inicializa o tema (carrega preferências e aplica classes no body)
    try {
      this.themeService.initializeTheme();
      this.themeIcon = this.themeService.getThemeIcon();
    } catch (err) {
      // Se algo der errado, mantém o ícone padrão
      console.warn('Theme initialization failed', err);
    }
    
  }
  
  // ⬅️ NOVO: Hook para remover a subscrição quando a página for destruída
  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }
  
  
  // --- Sistema de Tema ---
  toggleTheme() {
    this.themeService.toggleTheme();
    this.themeIcon = this.themeService.getThemeIcon();
  }
  
  // --- Resto do código permanece igual ---
  loadUserData() {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      this.editUser = { ...this.user };
    }
  }

  saveUserData() {
    localStorage.setItem('userData', JSON.stringify(this.user));
  }

  openEditModal(){
    // prepara os dados para edição
    // ⬅️ GARANTIA: Usa os dados mais recentes carregados
    this.editUser = { ...this.user };
    this.isModalOpen = true;
  }

  closeEditModal() {
    this.isModalOpen = false;
  }


  // ⬅️ ALTERADO: Substituída a função saveProfile com lógica do Firebase
  async saveProfile(){
    // validação mínima
    if (!this.currentUser) return this.showAlert('Erro', 'Nenhum usuário logado.');
    if (!this.editUser.name || !this.editUser.email) {
      return this.showAlert('Aviso', 'Preencha nome e email.');
    }
    
    const nomeMudou = this.editUser.name !== this.user.name;
    const emailMudou = this.editUser.email !== this.user.email;

    if (!nomeMudou && !emailMudou) {
        this.isModalOpen = false;
        return this.showAlert('Aviso', 'Nenhuma alteração detectada.');
    }
    
    try {
        // 1. Tenta atualizar o Nome
        if (nomeMudou) {
            await updateProfile(this.currentUser, {
                displayName: this.editUser.name
            });
        }

        // 2. Tenta atualizar o E-mail (Pode falhar por segurança!)
        if (emailMudou) {
            await updateEmail(this.currentUser, this.editUser.email);
        }

        // Sucesso: Atualiza o estado local e fecha o modal
        this.user = { ...this.editUser }; 
        this.isModalOpen = false;
        
        let msg = 'Perfil atualizado com sucesso!';
        if (emailMudou) {
            msg += ' (Verifique sua caixa de entrada para o novo e-mail)';
        }
        this.showAlert('Sucesso', msg);

    } catch (e: any) {
        const errorCode = e?.code || 'auth/unknown-error';
        const errorMessage = this.translateError(errorCode);
        //this.showAlert('Falha na Atualização', errorMessage);


        // ⬅️ NOVO: Se o erro for de re-autenticação, desloga o usuário.
        if (errorCode === 'auth/requires-recent-login') {
            // Exibe o alerta e, após o usuário clicar em OK, desloga.
            await this.showAlert('Falha na Atualização', errorMessage);
            this.sair(); // Função que desloga e redireciona para /login
            this.isModalOpen = false; // Fecha o modal
            return;
        }

        // Para outros erros, apenas exibe o alerta
        this.showAlert('Falha na Atualização', errorMessage);
    }
  
  }

  // ⬅️ NOVAS FUNÇÕES: Para mensagens amigáveis e tratamento de erro
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Handler para quando o usuário selecionar um arquivo de imagem
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        this.profileImage = result;
        try {
          localStorage.setItem('profileImage', result);
        } catch (e) {
          console.warn('Não foi possível salvar a imagem no localStorage', e);
        }
      }
    };
    reader.readAsDataURL(file);
  }

  private translateError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/requires-recent-login':
        return 'Para mudar o e-mail ou senha, por favor, faça logout e login novamente.'; 
      case 'auth/invalid-email':
        return 'O e-mail fornecido é inválido.';
      case 'auth/email-already-in-use':
        return 'O novo e-mail já está em uso.';
      default:
        return 'Ocorreu um erro desconhecido. Tente novamente.';
    }
  }



  // Navega para Favoritos
  goFavoritos() {
    this.navCtrl.navigateRoot('/favoritos');
  }

  // Já está na página do usuário (placeholder)
  goUser() {
    // permanece aqui por compatibilidade - sem ação
  }
  goHome() {
    this.navCtrl.navigateRoot('/home');
  }

  async sair() {
    await signOut(this.auth);
    await this.router.navigateByUrl('/login');
  }


}