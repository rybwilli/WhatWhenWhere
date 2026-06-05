import { Injectable } from '@angular/core';
import {
  signIn, signOut, signUp, getCurrentUser,
  fetchUserAttributes, signInWithRedirect, confirmSignUp,
  resetPassword, confirmResetPassword,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { BehaviorSubject, Observable } from 'rxjs';
import { generateClient } from 'aws-amplify/api';
import { HttpClient } from '@angular/common/http';
import { CharacterAvatarService } from './character-avatar.service';

export interface AppUser {
  userId: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phone?: string;
  character?: { name: string; team: string; position: string; imagePath: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$$ = new BehaviorSubject<AppUser | null>(null);
  readonly user$: Observable<AppUser | null> = this.user$$.asObservable();
  private client = generateClient();

  constructor(private characterAvatar: CharacterAvatarService, private http: HttpClient) {
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
      const authUser = await getCurrentUser();
      const userId = authUser.userId;
      const attrs = await fetchUserAttributes();

      const existingUser = this.user$$.value;
      let character = existingUser?.character;

      if (!character) {
        character = await this.loadSavedPlayer(userId) || await this.characterAvatar.getRandomCharacter();
      }

      this.user$$.next({
        userId,
        email: attrs.email ?? '',
        displayName: attrs.name ||
          [attrs.given_name, attrs.family_name].filter(Boolean).join(' ') ||
          attrs.email || '',
        photoURL: attrs.picture ?? null,
        phone: undefined,
        character,
      });
    } catch {
      this.user$$.next(null);
    }
  }

  private async loadSavedPlayer(userId: string): Promise<AppUser['character'] | null> {
    try {
      const result: any = await this.http.post(
        'https://6ma4vxkx0g.execute-api.us-east-1.amazonaws.com/dev/get-profile',
        { userId },
        { headers: { 'Content-Type': 'application/json' } }
      ).toPromise();
      const p = result?.profile;
      if (p?.playerName) {
        return { name: p.playerName, team: p.playerTeam || '', position: p.playerPosition || '', imagePath: p.playerImageUrl || '' };
      }
    } catch {
      console.log('No saved profile found');
    }
    return null;
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

  async resetPassword(email: string): Promise<void> {
    await resetPassword({ username: email });
  }

  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
    await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
  }


  setCharacter(character: AppUser['character']): void {
    const user = this.user$$.value;
    if (user) this.user$$.next({ ...user, character });
  }

  getCurrentUser(): AppUser | null {
    return this.user$$.value;
  }
}
