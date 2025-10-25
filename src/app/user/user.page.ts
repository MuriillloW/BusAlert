import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
  IonCardContent, IonModal, ActionSheetController, IonTab, IonTabs, IonTabBar, IonTabButton  } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, star, close } from 'ionicons/icons'
import { library, playCircle, radio, search } from 'ionicons/icons';


@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
    IonCardSubtitle, IonCardContent, IonModal, IonTab, IonTabs, IonTabBar, IonTabButton ]
})
export class UserPage implements OnInit {


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
}

addIcons ({ home, person, star, close})
addIcons({ library, playCircle, radio, search });
