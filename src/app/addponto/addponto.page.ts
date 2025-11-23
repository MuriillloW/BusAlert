import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonTextarea, IonButton } from '@ionic/angular/standalone';
import { PontoService, Ponto } from '../services/pontos';
import { NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-addponto',
  templateUrl: './addponto.page.html',
  styleUrls: ['./addponto.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonTextarea, IonButton]
})
export class AddpontoPage implements OnInit {

  ponto: Partial<Ponto> = {
    title: '',
    subtitle: '',
    img: 'assets/pontos/Praca7.jpg',
    desc: ''
  };

  constructor(private pontoService: PontoService, private navCtrl: NavController) { }

  ngOnInit() {
  }

  async onSubmit() {
    if (this.ponto.title) {
      try {
        const newPonto = {
          title: this.ponto.title!,
          subtitle: this.ponto.subtitle,
          img: this.ponto.img,
          desc: this.ponto.desc
        };
        await this.pontoService.add(newPonto);
        this.navCtrl.navigateBack('/home');
      } catch (error) {
        console.error('Erro ao adicionar ponto:', error);
      }
    }
  }

}
