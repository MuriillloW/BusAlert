import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, Subscription, take } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, serverTimestamp } from '@angular/fire/firestore';

export interface Ponto {
  id: string;
  title: string;
  subtitle?: string;
  img?: string;
  desc?: string;
}

const Initial: Ponto [] = [
    {   id: 'P01',
        title: 'Avenida Cesário de Melo',
        subtitle: 'Nº2230',
        img: 'assets/pontos/Praca7.jpg',
        desc: 'Em frente à creche.'
    },

    {   id: 'P02',
        title: 'Estrada da Cachorra',
        subtitle: 'Nº2230',
        img: 'assets/pontos/Praca7.jpg',
        desc: 'Próximo ao mercado Super Compras.'
    },

    {   id: 'P03',
        title: 'Rua das Flores',
        subtitle: 'Nº150',
        img: 'assets/pontos/Praca7.jpg',
        desc: 'Próximo ao parque das flores.'
      },

    {  id: 'P04',
        title: 'Avenida Brasil',
        subtitle: 'Nº1000',
        img: 'assets/pontos/Praca7.jpg',
        desc: 'Próximo ao shopping.'
    },

    {
        id: 'P05',
        title: 'Rua do Sol',
        subtitle: 'Nº500',
        img: 'assets/pontos/Praca7.jpg',
        desc: 'Em frente à padaria Pão Quente.'
    }

    ];
@Injectable({ providedIn: 'root' })
export class PontoService {
    private pontos$ = new BehaviorSubject<Ponto[]>(Initial);
    // favoritos: local cache de ids
    private FAVORITES_KEY = 'favorites';
    private favoriteIds$ = new BehaviorSubject<string[]>(this.readFavoriteIds());
    private favUnsub?: Subscription;

    constructor(private auth: Auth, private firestore: Firestore) {
        // observando alteração de autenticação para sincronizar favoritos do usuário
        authState(this.auth).subscribe(user => {
            if (user) {
                this.syncFavoritesFromFirestore(user.uid);
            } else {
                // sem usuário: usa localStorage
                this.favUnsub?.unsubscribe();
                this.favoriteIds$.next(this.readFavoriteIds());
            }
        });
    }

    getAll(): Observable<Ponto[]> {
        return this.pontos$.asObservable();
    }

    // retorna com pontos que são favoritos
    getFavorites(): Observable<Ponto[]> {
        return combineLatest([this.pontos$.asObservable(), this.favoriteIds$.asObservable()]).pipe(
            map(([pontos, ids]) => pontos.filter(p => ids.includes(p.id)))
        );
    }

    isFavorite(id: string) {
        return this.favoriteIds$.value.includes(id);
    }

    toggleFavorite(id: string) {
        // atualiza cache local imediatamente
        const ids = [...this.favoriteIds$.value];
        const idx = ids.indexOf(id);
        const adding = idx === -1;
        if (adding) ids.push(id);
        else ids.splice(idx, 1);
        this.favoriteIds$.next(ids);

        // persiste no backend se houver usuário autenticado, se não em localStorage
        authState(this.auth).pipe(take(1)).subscribe(user => {
            if (user) {
                const docRef = doc(this.firestore, `users/${user.uid}/favorites/${id}`);
                if (adding) {
                    setDoc(docRef, { id, savedAt: serverTimestamp() }).catch(console.error);
                } else {
                    deleteDoc(docRef).catch(console.error);
                }
            } else {
                try { localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(ids)); } catch (e) { }
            }
        });
    }

    private readFavoriteIds(): string[] {
        try {
            const raw = localStorage.getItem(this.FAVORITES_KEY);
            return raw ? JSON.parse(raw) as string[] : [];
        } catch (e) {
            return [];
        }
    }

    private syncFavoritesFromFirestore(uid: string) {
        this.favUnsub?.unsubscribe();
        const favCol = collection(this.firestore, `users/${uid}/favorites`);
        this.favUnsub = (collectionData(favCol, { idField: 'id' }) as Observable<any[]>)
            .subscribe(docs => {
                const ids = docs.map(d => d.id as string);
                this.favoriteIds$.next(ids);
            });
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