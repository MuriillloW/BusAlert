import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
  IonCardContent, IonModal, ActionSheetController, IonTab, IonTabs, IonTabBar, IonTabButton } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, star, close } from 'ionicons/icons'
import { Subscription } from 'rxjs';
import { Ponto, PontoService } from '../services/pontos';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
    IonCardSubtitle, IonCardContent, IonModal, IonTab, IonTabs, IonTabBar, IonTabButton  ],
})
export class HomePage implements OnInit, OnDestroy {
  // Lista de pontos — Opção A: usar *ngFor para gerar a lista
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
addIcons({ home, person, star, close })
