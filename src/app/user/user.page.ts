import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
  IonCardContent, IonModal, IonInput, IonItem, IonLabel, ActionSheetController, IonTab, IonTabs, IonTabBar, IonTabButton  } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, star, close, createOutline } from 'ionicons/icons'



@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
    IonCardSubtitle, IonCardContent, IonModal, IonInput, IonItem, IonLabel, IonTab, IonTabs, IonTabBar, IonTabButton ]
})
export class UserPage implements OnInit {

  isModalOpen = false;
  user: { name: string; email: string } = { name: 'Nome', email: 'exemplo@exemplo.com' };
  editUser: { name: string; email: string } = { ...this.user };
  



  ngOnInit() {
  }

  

  constructor(private navCTRL: NavController) { }
  goHome(){
    this.navCTRL.navigateRoot('/home');
  }

  goFavoritos(){
    this.navCTRL.navigateRoot('/favoritos');
  }

  goUser(){
    this.navCTRL.navigateRoot('/user');
  }

  openEditModal(){
    // prepara os dados para edição
    this.editUser = { ...this.user };
    this.isModalOpen = true;
  }

  closeEditModal(){
    this.isModalOpen = false;
  }

  saveProfile(){
    // validação mínima
    if(!this.editUser.name || !this.editUser.email){
      window.alert('Preencha nome e email.');
      return;
    }
    this.user = { ...this.editUser };
    this.isModalOpen = false;
    window.alert('Perfil atualizado.');
  }
}

addIcons({ home, person, star, close, createOutline });
