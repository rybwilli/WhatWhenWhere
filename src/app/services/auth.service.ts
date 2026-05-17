import { Injectable } from '@angular/core';
import {
  signIn, signOut, signUp, getCurrentUser,
  fetchUserAttributes, signInWithRedirect, confirmSignUp,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppUser {
  userId: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$$ = new BehaviorSubject<AppUser | null>(null);
  readonly user$: Observable<AppUser | null> = this.user$$.asObservable();

  constructor() {
    this.refreshUser();
    Hub.listen('auth', ({ payload }: any) => {
      switch (payload.event) {
        case 'signedIn':
        case 'tokenRefresh':
          this.refreshUser();
          break;
        case 'signedOut':
          this.user$$.next(null);
          break;
      }
    });
  }

  private async refreshUser(): Promise<void> {
    try {
      const { userId } = await getCurrentUser();
      const attrs = await fetchUserAttributes();
      this.user$$.next({
        userId,
        email: attrs.email ?? '',
        displayName: attrs.name || attrs.email || '',
        photoURL: attrs.picture ?? null,
      });
    } catch {
      this.user$$.next(null);
    }
  }

  async loginWithGoogle(): Promise<void> {
    await signInWithRedirect({ provider: 'Google' });
  }

  async loginWithEmail(email: string, password: string): Promise<void> {
    await signIn({ username: email, password });
    await this.refreshUser();
  }

  async registerWithEmail(email: string, password: string, displayName: string): Promise<void> {
    await signUp({
      username: email,
      password,
      options: { userAttributes: { email, name: displayName } },
    });
  }

  async confirmEmail(email: string, code: string): Promise<void> {
    await confirmSignUp({ username: email, confirmationCode: code });
  }

  async logout(): Promise<void> {
    await signOut();
  }

  getCurrentUser(): AppUser | null {
    return this.user$$.value;
  }
}
