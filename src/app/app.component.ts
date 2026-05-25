import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CharacterAvatarService } from './services/character-avatar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  user$ = this.auth.user$;
  character: any = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private characterAvatar: CharacterAvatarService
  ) {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.character = this.characterAvatar.getRandomCharacter();
      }
    });
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.auth.logout().then(() => this.router.navigate(['/login']));
  }
}
