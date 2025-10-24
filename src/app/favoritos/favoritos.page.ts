import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
  IonCardContent, IonModal, ActionSheetController  } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, star, close } from 'ionicons/icons'
import { NavController } from '@ionic/angular/standalone';



@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
    IonCardSubtitle, IonCardContent, IonModal  ]
})
export class FavoritosPage implements OnInit {
  isModalOpen = false;

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
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

  
  ngOnInit() {}

}
addIcons ({ home, person, star, close})

