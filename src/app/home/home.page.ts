import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
  IonCardContent, IonModal, ActionSheetController, } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, star, close, starOutline, add, bluetooth } from 'ionicons/icons'
import { Subscription } from 'rxjs';
import { Ponto, PontoService } from '../services/pontos';
import { AlertController } from '@ionic/angular';
import { BluetoothService } from '../services/bluetooth.service';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButtons ,IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
    IonCardSubtitle, IonCardContent, IonModal,  ],
})


export class HomePage implements OnInit, OnDestroy {
  // Lista de pontos — Opção A: usar *ngFor para gerar a lista
  points: Ponto[] = [];
  selectedPoint: Ponto | null = null;
  isModalOpen = false;
  private sub?: Subscription;
  devices: any[] = [];

  @ViewChild(IonModal) modal!: IonModal;

  constructor(
    private pontoService: PontoService, 
    private navCTRL: NavController, 
    private btService: BluetoothService,
    private userService: UserService
  ) {}

  get isMaster(): boolean {
    return this.userService.isMaster();
  }



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
    this.modal.dismiss();
  }

  onModalDismiss() {
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

  goAddPonto(){
    this.navCTRL.navigateRoot('/addponto');
  }

    goEditUser() {
    // usa NavController para manter stack de navegação
    this.navCTRL.navigateRoot('/edit-user');
  }

  async sendAlert() {
    // Verifica se há conexão ativa (precisamos de uma forma de saber se está conectado, 
    // idealmente o serviço deveria manter esse estado ou expor um Observable)
    // Como paliativo, tentamos enviar direto. Se falhar, o catch pega.
    
    if (!this.btService.hasPlugin()) {
      // await this.showAlert('Atenção', 'Envio de dados funciona apenas em dispositivo móvel com o plugin instalado.');
      console.warn('Plugin Bluetooth não disponível (ambiente web?)');
      return;
    }

    try {
      // Envia '1' para ligar o LED (mesma lógica do EditUserPage)
      await this.btService.write('1');
      console.log('Dado enviado: 1');
      // Feedback visual simples (opcional, já que o alerta pode ser intrusivo na home)
      // await this.showAlert('Sucesso', 'Alerta enviado ao dispositivo.');
    } catch (err: any) {
      console.error('Erro ao enviar alerta', err);
      // await this.showAlert('Erro', 'Falha ao enviar alerta: ' + (err?.message || err));
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
addIcons({ home, person, star, close, starOutline, add, bluetooth })
