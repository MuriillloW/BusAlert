import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, star } from 'ionicons/icons'
import { NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-button-page',
  templateUrl: './button-page.page.html',
  styleUrls: ['./button-page.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonFooter, IonButtons ,IonButton, IonIcon ]
})
export class ButtonPagePage implements OnInit {

  constructor( private navCTRL : NavController) { }

  goHome(){
    this.navCTRL.navigateRoot('/home');
  }

  goFavoritos(){
    this.navCTRL.navigateRoot('/favoritos');
  }

  goUser(){
    this.navCTRL.navigateRoot('/user');
  }
  
  ngOnInit() {
  }

}

addIcons ({ home, person, star })