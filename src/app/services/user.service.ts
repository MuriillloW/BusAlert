import { Injectable } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string;
  nome?: string;
  cep?: string;
  role?: 'user' | 'master';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserProfile$ = new BehaviorSubject<UserProfile | null>(null);

  constructor(private auth: Auth, private firestore: Firestore) {
    authState(this.auth).pipe(
      switchMap((user: User | null) => {
        if (user) {
          const userDoc = doc(this.firestore, `users/${user.uid}`);
          return docData(userDoc, { idField: 'uid' }) as Observable<UserProfile>;
        } else {
          return of(null);
        }
      })
    ).subscribe((profile) => {
      this.currentUserProfile$.next(profile);
    });
  }

  get profile$(): Observable<UserProfile | null> {
    return this.currentUserProfile$.asObservable();
  }

  get currentProfile(): UserProfile | null {
    return this.currentUserProfile$.value;
  }

  isMaster(): boolean {
    return this.currentUserProfile$.value?.role === 'master';
  }
}
