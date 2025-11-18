import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonModal, ActionSheetController } from '@ionic/angular/standalone';

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
    IonCardSubtitle, IonCardContent, IonModal,  ]
})
export class FavoritosPage implements OnInit, OnDestroy {
  points: Ponto[] = [];
  selectedPoint: Ponto | null = null;
  isModalOpen = false;
  private sub?: Subscription;
  private subFav?: Subscription;

  constructor(private pontoService: PontoService, private navCTRL: NavController) {}

  ngOnInit() {
    this.sub = this.pontoService.getAll().subscribe(list => {
      // mantém lista completa em memória se necessário
      // a lista exibida de favoritos vem de getFavorites()
    });
    this.subFav = this.pontoService.getFavorites().subscribe(favs => this.points = favs);
  }
  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.subFav?.unsubscribe();

  }
  // métodos para  abrir/fechar o modal com dados do ponto
  openModal(p: Ponto) {
    this.selectedPoint = p;
    this.isModalOpen = true;
  } 

  closeModal() {
    this.isModalOpen = false;
    this.selectedPoint = null;
  }


  // Delegam para PontoService as operações de favoritos
  isFavorite(p?: Ponto | null): boolean {
    if (!p) return false;
    return this.pontoService.isFavorite(p.id);
  }

  toggleFavorite(p: Ponto | null) {
    if (!p) return;
    this.pontoService.toggleFavorite(p.id);
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

