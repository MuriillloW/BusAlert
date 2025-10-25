import { AfterViewInit, Component, ElementRef, OnDestroy, Renderer2, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, GestureController, Gesture, NavController,  } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronUp } from 'ionicons/icons'

@Component({
  selector: 'app-zero-page',
  standalone: true,
  templateUrl: './zero-page.page.html',
  styleUrls: ['./zero-page.page.scss'],
  imports: [CommonModule, IonicModule]
})
export class ZeroPagePage implements AfterViewInit, OnDestroy {
  @ViewChild('dragContainer', { read: ElementRef }) dragContainer!: ElementRef;
  private gesture?: Gesture;
  private currentTranslate = 0;
  private readonly threshold = -160;
  private readonly animDuration = 300;

  private readonly gestureCtrl = inject(GestureController);
  private readonly renderer = inject(Renderer2);
  private readonly router = inject(Router);
  private readonly navCtrl = inject(NavController);

  ngAfterViewInit(): void {
    if (!this.dragContainer) return;

    this.gesture = this.gestureCtrl.create({
      el: this.dragContainer.nativeElement,
      gestureName: 'drag-up',
      direction: 'y',
      threshold: 5,
      onMove: ev => this.onMove(ev),
      onEnd: ev => this.onEnd(ev)
    });

    this.gesture.enable(true);
  }

  private onMove(ev: any) {
    const deltaY = Math.min(0, ev.deltaY);
    this.currentTranslate = deltaY;
    this.renderer.setStyle(this.dragContainer.nativeElement, 'transition', 'none');
    this.renderer.setStyle(this.dragContainer.nativeElement, 'transform', `translateY(${this.currentTranslate}px)`);
    const opacity = Math.max(0.3, 1 + this.currentTranslate / 400);
    this.renderer.setStyle(this.dragContainer.nativeElement, 'opacity', `${opacity}`);
  }

  private onEnd(ev: any) {
    if (ev.deltaY <= this.threshold) {
      this.animateOut();
    } else {
      this.resetPosition();
    }
  }

  private animateOut() {
    const element = this.dragContainer.nativeElement;
    this.renderer.setStyle(element, 'transition', `transform ${this.animDuration}ms ease-out, opacity ${this.animDuration}ms`);
    this.renderer.setStyle(element, 'transform', `translateY(-120vh)`);
    this.renderer.setStyle(element, 'opacity', `0`);
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, this.animDuration - 30);
  }

  private resetPosition() {
    const element = this.dragContainer.nativeElement;
    this.renderer.setStyle(element, 'transition', `transform ${this.animDuration}ms cubic-bezier(.2,.8,.2,1), opacity ${this.animDuration}ms`);
    this.renderer.setStyle(element, 'transform', `translateY(0)`);
    this.renderer.setStyle(element, 'opacity', `1`);
  }

  ngOnDestroy(): void {
    this.gesture?.destroy();
  }

  

}

addIcons({ chevronUp });
