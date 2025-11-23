import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonModal, IonInput, IonItem, IonLabel, ActionSheetController, IonTab, IonTabs, IonTabBar, IonTabButton, AlertController, IonToggle  } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, star, close, createOutline, sunny, moon, cameraReverseOutline } from 'ionicons/icons'
import { Auth, authState, signOut, User, user, updateProfile, updateEmail } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
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
  private firestore = inject(Firestore);
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
  user: { name: string; email: string; cep: string } = { name: 'Carregando...', email: 'Carregando...', cep: 'Carregando...' };
  editUser: { name: string; email: string; cep: string } = { ...this.user };
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
     
    }
    {
    }
    this.userSubscription = user(this.auth).subscribe(async u => {
      this.currentUser = u;
      if (u) {
        this.user.name = u.displayName || 'Usuário Sem Nome';
        this.user.email = u.email || 'E-mail não disponível';
        
        try {
          const userDocRef = doc(this.firestore, `users/${u.uid}`);
          const userSnapshot = await getDoc(userDocRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            this.user.cep = userData['cep'] || 'CEP não cadastrado';
          } else {
            this.user.cep = 'CEP não encontrado';
          }
        } catch (e) {
          console.error('Erro ao buscar dados do usuário:', e);
          this.user.cep = 'Erro ao carregar CEP';
        }

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

  onCepInput(event: any) {
    let val = event.target.value?.toString() || '';
    val = val.replace(/\D/g, ''); // Remove não dígitos
    
    if (val.length > 8) {
      val = val.substring(0, 8);
    }

    if (val.length > 5) {
      val = val.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    
    this.editUser.cep = val;
    event.target.value = val; 
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
    const cepMudou = this.editUser.cep !== this.user.cep;

    if (!nomeMudou && !emailMudou && !cepMudou) {
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

        // Atualiza também no Firestore para manter consistência
        if (nomeMudou || emailMudou || cepMudou) {
          try {
            const userDocRef = doc(this.firestore, `users/${this.currentUser.uid}`);
            await setDoc(userDocRef, {
              nome: this.editUser.name,
              email: this.editUser.email,
              cep: this.editUser.cep
            }, { merge: true });
          } catch (fsError) {
            console.error('Erro ao atualizar Firestore:', fsError);
          }
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
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    
    try {
      // Comprime a imagem antes de salvar
      const compressedBase64 = await this.compressImage(file);
      
      this.profileImage = compressedBase64;
      
      // Salva no localStorage (agora muito mais leve)
      try {
        localStorage.setItem('profileImage', compressedBase64);
        await this.showAlert('Sucesso', 'Foto de perfil atualizada!');
      } catch (e) {
        console.warn('Erro ao salvar no localStorage', e);
        await this.showAlert('Aviso', 'Foto muito grande para salvar localmente.');
      }

    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      await this.showAlert('Erro', 'Falha ao processar a imagem.');
    }
  }

  // Função auxiliar para redimensionar e comprimir a imagem
  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Canvas context not available');

          // Define o tamanho máximo (ex: 500px)
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Retorna a imagem comprimida (JPEG com qualidade 0.7)
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
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

  // Navega para a página de verificação de conexões Bluetooth (edit-user)
  goEditUser() {
    // usa NavController para manter stack de navegação
    this.navCtrl.navigateRoot('/edit-user');
  }

  async sair() {
    await signOut(this.auth);
    await this.router.navigateByUrl('/login');
  }


}

 addIcons({ home, person, star, close, createOutline, moon, sunny, cameraReverseOutline });