import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, Subscription, take } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, serverTimestamp, addDoc, updateDoc } from '@angular/fire/firestore';

export interface Ponto {
  id: string;
  title: string;
  subtitle?: string;
  img?: string;
  desc?: string;
}

@Injectable({ providedIn: 'root' })
export class PontoService {
    private pontos$: Observable<Ponto[]>;
    // favoritos: local cache de ids
    private FAVORITES_KEY = 'favorites';
    private favoriteIds$ = new BehaviorSubject<string[]>(this.readFavoriteIds());
    private favUnsub?: Subscription;

    constructor(private auth: Auth, private firestore: Firestore) {
        const pontosCollection = collection(this.firestore, 'pontos');
        this.pontos$ = collectionData(pontosCollection, { idField: 'id' }) as Observable<Ponto[]>;

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
        return this.pontos$;
    }

    // retorna com pontos que são favoritos
    getFavorites(): Observable<Ponto[]> {
        return combineLatest([this.pontos$, this.favoriteIds$.asObservable()]).pipe(
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

    add(ponto: Omit<Ponto, 'id'>) {
        const pontosCollection = collection(this.firestore, 'pontos');
        return addDoc(pontosCollection, ponto);
    }

    update(updated: Ponto) {
        const docRef = doc(this.firestore, `pontos/${updated.id}`);
        return updateDoc(docRef, { ...updated });
    }

    remove(id: string) {
        const docRef = doc(this.firestore, `pontos/${id}`);
        return deleteDoc(docRef);
    }
}