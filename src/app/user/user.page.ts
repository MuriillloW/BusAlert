import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons, IonButton, 
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, 
  IonModal, IonInput, IonItem, IonLabel, IonToggle
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, star, close, createOutline, moon, sunny } from 'ionicons/icons';
import { ThemeService } from '../services/theme.service'; // ← ADICIONE ESTE IMPORT

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
export class UserPage implements OnInit, OnDestroy {
  isModalOpen = false;
  themeIcon = 'moon';
  user: { name: string; email: string } = { name: 'Nome', email: 'exemplo@exemplo.com' };
  editUser: { name: string; email: string } = { ...this.user };
  notificationsEnabled: boolean = true;

  constructor(
    private navCTRL: NavController,
    private themeService: ThemeService // ← INJETE O SERVIÇO
  ) { 
    addIcons({ home, person, star, close, createOutline, moon, sunny });
  }

  ngOnInit() {
    this.themeService.initializeTheme();
    this.themeIcon = this.themeService.getThemeIcon();
    this.loadUserData();
  }

  ngOnDestroy() {
    // Cleanup se necessário
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

  openEditModal() {
    this.editUser = { ...this.user };
    this.isModalOpen = true;
  }

  closeEditModal() {
    this.isModalOpen = false;
  }

  saveProfile() {
    if (!this.editUser.name?.trim() || !this.editUser.email?.trim()) {
      window.alert('Preencha nome e email.');
      return;
    }
    
    this.user = { ...this.editUser };
    this.saveUserData();
    this.isModalOpen = false;
    window.alert('Perfil atualizado com sucesso!');
  }

  goHome() {
    this.navCTRL.navigateRoot('/home');
  }

  goFavoritos() {
    this.navCTRL.navigateRoot('/favoritos');
  }

  goUser() {
    // Já está na página do usuário
  }
}