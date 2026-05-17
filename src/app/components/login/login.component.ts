import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type EmailMode = 'signin' | 'register' | 'confirm';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  emailMode: EmailMode = 'signin';
  loading = false;
  error = '';

  email = '';
  password = '';
  displayName = '';
  confirmCode = '';

  constructor(private auth: AuthService, private router: Router) {}

  private async run(fn: () => Promise<void>): Promise<void> {
    this.error = '';
    this.loading = true;
    try {
      await fn();
    } catch (e: any) {
      this.error = e?.message ?? 'Authentication failed';
    } finally {
      this.loading = false;
    }
  }

  loginGoogle(): void {
    this.run(() => this.auth.loginWithGoogle());
    // page will redirect — no navigate needed
  }

  async submitEmail(): Promise<void> {
    if (this.emailMode === 'signin') {
      await this.run(async () => {
        await this.auth.loginWithEmail(this.email, this.password);
        this.router.navigate(['/']);
      });
    } else {
      await this.run(async () => {
        await this.auth.registerWithEmail(this.email, this.password, this.displayName);
        this.emailMode = 'confirm';
      });
    }
  }

  async submitConfirm(): Promise<void> {
    await this.run(async () => {
      await this.auth.confirmEmail(this.email, this.confirmCode);
      await this.auth.loginWithEmail(this.email, this.password);
      this.router.navigate(['/']);
    });
  }
}
