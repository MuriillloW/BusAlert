import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
  IonCardContent, IonModal, ActionSheetController, IonTab, IonTabs, IonTabBar, IonTabButton } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, star, close, starOutline } from 'ionicons/icons'
import { Subscription } from 'rxjs';
import { Ponto, PontoService } from '../services/pontos';



@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
    IonCardSubtitle, IonCardContent, IonModal, IonTab, IonTabs, IonTabBar, IonTabButton  ]
})
export class FavoritosPage implements OnInit, OnDestroy {
  points: Ponto[] = [];
  selectedPoint: Ponto | null = null;
  isModalOpen = false;
  private sub?: Subscription;

  constructor(private pontoService: PontoService, private navCTRL: NavController) {}

  ngOnInit() {
    this.sub = this.pontoService.getAll().subscribe(list => this.points = list);
  }
  ngOnDestroy() {
    this.sub?.unsubscribe();

  }
  // métodos para abrir/fechar o modal com dados do ponto
  openModal(p: Ponto) {
    this.selectedPoint = p;
    this.isModalOpen = true;
  } 

  closeModal() {
    this.isModalOpen = false;
    this.selectedPoint = null;
  }

  
 //navegação entre páginas
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
addIcons ({ home, person, star, close, starOutline })

