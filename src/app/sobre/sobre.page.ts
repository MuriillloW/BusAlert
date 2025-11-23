import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoGithub, handLeftOutline } from 'ionicons/icons';

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
      photo: 'assets/team/josh.jpg',
      github: 'MrJosh180',
      funGif: 'assets/team/gifjosh.gif', // Um gif engraçado
      superPower: 'Fã do Sonic.',
      isFlipped: false, // Controla a animação
      stats: [
        { name: 'Café', value: 90, color: '#6f4e37' },
        { name: 'Ionic', value: 75, color: '#2965f1' },
        { name: 'Paciência', value: 20, color: '#ff4444' }
      ]
    },
    {
      name: 'Murilo Peres',
      role: 'Desenvolvedor Fullstack',
      photo: 'assets/team/murilo.jpg',
      github: 'MuriillloW',
      funGif: 'assets/team/gifmurilo.gif',
      superPower: 'Vai Teia.',
      isFlipped: false,
      stats: [
        { name: 'Café', value: 30, color: '#6f4e37' },
        { name: 'Ionic', value: 95, color: '#3880ff' },
        { name: 'Sono', value: 90, color: '#9c27b0' }
      ]
    },
    {
      name: 'Lucas',
      role: 'Desenvolvedor Fullstack',
      photo: 'assets/team/lucas.jpg',
      github: 'LCMedeiros',
      funGif: 'assets/team/giflucas.gif', // Um gif engraçado
      superPower: 'Acelerador de Particulas Ambulante.',
      isFlipped: false, // Controla a animação
      stats: [
        { name: 'Café', value: 10, color: '#6f4e37' },
        { name: 'Angular', value: 75, color: '#2965f1' },
        { name: 'Paciência', value: 100, color: '#ff4444' }
      ]
    },
    {
      name: 'Ana',
      role: 'Desenvolvedora Fullstack',
      photo: 'assets/team/ana.jpg',
      github: 'anabeatrizarguelho',
      funGif: 'assets/team/gifana.gif', // Um gif engraçado
      superPower: 'Dorameira Profissional.',
      isFlipped: false, // Controla a animação
      stats: [
        { name: 'Café', value: 100, color: '#6f4e37' },
        { name: 'CSS', value: 75, color: '#2965f1' },
        { name: 'Paciência', value: 20, color: '#ff4444' }
      ]
    },
  ];

  constructor() {
      addIcons({handLeftOutline,logoGithub}); }

  ngOnInit() { }

  toggleCard(member: any) {
    member.isFlipped = !member.isFlipped;
  }
}
