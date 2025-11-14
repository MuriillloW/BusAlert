import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: 'light' | 'dark' = 'light';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.setTheme(prefersDark.matches ? 'dark' : 'light');
    }
  }

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    const body = document.body;
    
    // Remove todas as classes de tema
    this.renderer.removeClass(body, 'light-theme');
    this.renderer.removeClass(body, 'dark-theme');
    
    // Adiciona a classe do tema atual
    this.renderer.addClass(body, `${theme}-theme`);
    
    // Salva no localStorage
    localStorage.setItem('theme', theme);
    
    // Atualiza o atributo theme para componentes Ionic
    this.renderer.setAttribute(body, 'data-theme', theme);
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  getThemeIcon(): string {
    return this.currentTheme === 'light' ? 'moon' : 'sunny';
  }
}