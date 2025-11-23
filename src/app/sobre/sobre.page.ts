import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoGithub } from 'ionicons/icons';

@Component({
  selector: 'app-sobre',
  templateUrl: './sobre.page.html',
  styleUrls: ['./sobre.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonButtons, IonBackButton]
})
export class SobrePage implements OnInit {
// Lista de membros do grupo
  members = [
    {
      name: 'Josh',
      role: 'Desenvolvedor Fullstack',
      description: 'Mestre dos códigos e caçador de bugs.',
      image: 'assets/pontos/Praca7.jpg', // Coloque o caminho da foto aqui
      social: '@mrjosh180',
      color: '#ff4444' // Cor personalizada para borda ou detalhe
    },
    {
      name: 'Murilo Peres',
      role: 'Desenvolvedor Fullstack',
      description: 'O Cachorrão do Ponto.',
      image: 'assets/pontos/Praca7.jpg',
      social: '@MuriillloW',
      color: '#6f0197ff'
    },
    {
      name: 'Lucas Cunha',
      role: 'Desenvolvedor Fullstack',
      description: 'Acelerador de Particulas Ambulante.',
      image: 'assets/pontos/Praca7.jpg',
      social: '@DlucasCM',
      color: '#015714c7'
    },
       {
      name: 'Ana Beatriz Arguelho',
      role: 'Desenvolvedora Fullstack',
      description: 'Apaixonada por design e tecnologia.',
      image: 'assets/pontos/Praca7.jpg',
      social: '@anabeatrizarguelho',
      color: '#fce309f1'
    },
    // Adicione mais membros aqui...
  ];

  constructor() {
    addIcons({ logoGithub });
  }

  ngOnInit() { }
}
