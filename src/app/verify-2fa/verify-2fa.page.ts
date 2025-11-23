import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { AuthService } from '../services/auth.service';
import {
  IonContent,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonCardHeader,
  IonText,
  IonItem,
  IonCheckbox,
  IonLabel
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-2fa',
  templateUrl: './verify-2fa.page.html',
  styleUrls: ['./verify-2fa.page.scss'],
  standalone: true,
  imports: [
    CommonModule, // Add CommonModule
    IonContent,
    IonInput,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonText,
    IonItem,
    IonCheckbox,
    IonLabel,
    FormsModule
  ]
})
export class Verify2faPage {
  code: string = '';
  saveDevice: boolean = false;
  error: string = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  async verifyCode() {
    this.error = '';
    try {
      await this.authService.verify2faCode(this.code, this.saveDevice);
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (e: any) {
      this.error = e?.message || 'Código inválido ou expirado.';
    }
  }
}
