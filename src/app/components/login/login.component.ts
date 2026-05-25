import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type EmailMode = 'signin' | 'register' | 'confirm' | 'forgot' | 'reset';

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
  resetCode = '';
  newPassword = '';
  newPasswordConfirm = '';

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

  startForgotPassword(): void {
    this.emailMode = 'forgot';
    this.resetCode = '';
    this.newPassword = '';
    this.newPasswordConfirm = '';
    this.error = '';
  }

  async submitForgot(): Promise<void> {
    await this.run(async () => {
      await this.auth.resetPassword(this.email);
      this.emailMode = 'reset';
    });
  }

  async submitReset(): Promise<void> {
    if (this.newPassword !== this.newPasswordConfirm) {
      this.error = 'Passwords do not match';
      return;
    }
    await this.run(async () => {
      await this.auth.confirmPasswordReset(this.email, this.resetCode, this.newPassword);
      this.emailMode = 'signin';
      this.email = '';
      this.password = '';
      this.resetCode = '';
      this.newPassword = '';
      this.newPasswordConfirm = '';
      this.error = 'Password reset successful. Please sign in.';
    });
  }

  backToSignIn(): void {
    this.emailMode = 'signin';
    this.email = '';
    this.password = '';
    this.displayName = '';
    this.confirmCode = '';
    this.resetCode = '';
    this.newPassword = '';
    this.newPasswordConfirm = '';
    this.error = '';
  }
}
