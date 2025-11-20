import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
  IonCardContent, IonModal, ActionSheetController, } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, star, close, starOutline } from 'ionicons/icons'
import { Subscription } from 'rxjs';
import { Ponto, PontoService } from '../services/pontos';
import { Arduino } from '../services/arduino/arduino';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
    IonCardSubtitle, IonCardContent, IonModal],
})


export class HomePage implements OnInit, OnDestroy {
  // Lista de pontos — Opção A: usar *ngFor para gerar a lista
  points: Ponto[] = [];
  selectedPoint: Ponto | null = null;
  isModalOpen = false;
  private sub?: Subscription;

  constructor(private pontoService: PontoService, private navCTRL: NavController, private arduino: Arduino) {}

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

  async sendAlert() {
    // utiliza o serviço Arduino para alternar o estado (connect/write/disconnect)
    try {
      await this.arduino.sendAlert();
      console.log('Comando enviado ao Arduino com sucesso.');
      // feedback simples — se quiser, trocar por ToastController do Ionic
      window.alert('Comando enviado ao Arduino.');
    } catch (err) {
      console.error('Falha ao enviar comando ao Arduino', err);
      window.alert('Erro ao comunicar com Arduino: ' + String(err));
    }
  }

  // Favoritos que chamam o serviço PontoService 
  isFavorite(p?: Ponto | null): boolean {
    if (!p) return false;
    return this.pontoService.isFavorite(p.id);
  }

  toggleFavorite(p: Ponto | null) {
    if (!p) return;
    this.pontoService.toggleFavorite(p.id);
  }

}
addIcons({ home, person, star, close, starOutline })
