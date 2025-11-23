import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  heart, heartOutline, star, starOutline, home, person, 
  close, create, createOutline, checkmark, trash, add, 
  bluetooth, chevronUp, cameraReverseOutline, moon, sunny,
  logoGithub, arrowBackOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    // Registra ícones globalmente para evitar bugs de carregamento
    addIcons({ 
      heart, heartOutline, star, starOutline, home, person, 
      close, create, createOutline, checkmark, trash, add, 
      bluetooth, chevronUp, cameraReverseOutline, moon, sunny,
      logoGithub, arrowBackOutline
    });
  }
}
