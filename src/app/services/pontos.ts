import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Ponto {
  id: string;
  title: string;
  subtitle?: string;
  img?: string;
  desc?: string;
}

const Initial: Ponto [] = [
    {   id: 'p1',
        title: 'Avenida Cesário de Melo',
        subtitle: 'Nº2230',
        img: 'assets/pontos/Praca7.jpg',
        desc: 'Em frente à creche.'
    },

    {   id: 'p2',
        title: 'Estrada da Cachorra',
        subtitle: 'Nº2230',
        img: 'assets/pontos/Praca7.jpg',
        desc: 'Próximo ao mercado Super Compras.'
    },

    {   id: 'p3',
        title: 'Rua das Flores',
        subtitle: 'Nº150',
        img: 'assets/pontos/Praca7.jpg',
        desc: 'Próximo ao parque das flores.'
      }

    ];
@Injectable({ providedIn: 'root' })
export class PontoService {
    private pontos$ = new BehaviorSubject<Ponto[]>(Initial);

    getAll(): Observable<Ponto[]> {
        return this.pontos$.asObservable();
    }

    add(ponto: Ponto) {
        const list = [...this.pontos$.value, ponto];
        this.pontos$.next(list);
    }

    update(updated: Ponto) {
        const list = this.pontos$.value.map(p => p.id === updated.id ? updated : p);
        this.pontos$.next(list);
    }

    remove(id: string) {
        const list = this.pontos$.value.filter(p => p.id !== id);
        this.pontos$.next(list);
    }

    getById(id: string) {
        return this.pontos$.value.find(p => p.id === id) ?? null;
    }
}