import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, AppUser } from '../../services/auth.service';
import { CharacterAvatarService, Character } from '../../services/character-avatar.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: AppUser | null = null;
  editing = false;
  error = '';

  allPlayers: Character[] = [];
  filteredPlayers: Character[] = [];
  filterName = '';
  filterTeam = '';
  filterPosition = '';
  selectedPlayer: Character | null = null;
  useGooglePhoto = true;
  teams: string[] = [];
  positions: string[] = [];
  phone = '';
  notifyBy: 'email' | 'sms' = 'email';
  phoneVerified = false;
  verifyCodeSent = false;
  verifyCode = '';
  verifyError = '';
  sendingCode = false;
  confirmingCode = false;
  resendAvailableAt = 0;

  constructor(private auth: AuthService, private router: Router, private characterAvatar: CharacterAvatarService, private http: HttpClient) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      this.user = user;
    });
    this.characterAvatar.getAllPlayers().then(players => {
      this.allPlayers = players;
      this.filteredPlayers = players;
      this.teams = [...new Set(players.map(p => p.team).filter(Boolean))].sort();
      this.positions = [...new Set(players.map(p => p.position).filter(Boolean))].sort();
    });
  }

  startEdit(): void {
    this.editing = true;
    this.error = '';
    this.useGooglePhoto = this.user?.useGooglePhoto ?? true;
    this.selectedPlayer = this.user?.character ?? null;
    this.phone = this.user?.phone ?? '';
    this.notifyBy = this.user?.notifyBy ?? 'email';
    this.phoneVerified = !!(this.user?.phoneVerified && this.user?.phone === this.phone);
    this.verifyCodeSent = false;
    this.verifyCode = '';
    this.verifyError = '';
    this.applyFilter();
  }

  onPhoneChange(): void {
    this.phoneVerified = false;
    this.verifyCodeSent = false;
    this.verifyCode = '';
    this.verifyError = '';
  }

  canResendCode(): boolean {
    return Date.now() >= this.resendAvailableAt;
  }

  async sendVerificationCode(): Promise<void> {
    if (!this.phone.trim()) return;
    this.verifyError = '';
    this.sendingCode = true;
    try {
      await this.auth.startPhoneVerification(this.phone.trim());
      this.verifyCodeSent = true;
      this.verifyCode = '';
      this.resendAvailableAt = Date.now() + 60000;
    } catch (e: any) {
      this.verifyError = e?.message || 'Failed to send code';
    } finally {
      this.sendingCode = false;
    }
  }

  async confirmVerificationCode(): Promise<void> {
    if (!this.verifyCode.trim()) return;
    this.verifyError = '';
    this.confirmingCode = true;
    try {
      await this.auth.confirmPhoneVerification(this.phone.trim(), this.verifyCode.trim());
      this.phoneVerified = true;
      this.verifyCodeSent = false;
      this.verifyCode = '';
    } catch (e: any) {
      this.verifyError = e?.message || 'Incorrect code';
    } finally {
      this.confirmingCode = false;
    }
  }

  applyFilter(): void {
    this.filteredPlayers = this.allPlayers.filter(p => {
      const nameMatch = !this.filterName || p.name.toLowerCase().includes(this.filterName.toLowerCase());
      const teamMatch = !this.filterTeam || p.team === this.filterTeam;
      const posMatch  = !this.filterPosition || p.position === this.filterPosition;
      return nameMatch && teamMatch && posMatch;
    });
  }

  selectPlayer(player: Character): void {
    this.selectedPlayer = player;
  }

  async saveProfile(): Promise<void> {
    if (!this.user) return;
    if (!this.useGooglePhoto && !this.selectedPlayer) return;
    if (this.notifyBy === 'sms' && !this.phoneVerified) {
      this.error = 'Verify your phone number to get notified by text.';
      return;
    }
    this.auth.setCharacter(this.selectedPlayer ?? undefined);
    this.auth.setUseGooglePhoto(this.useGooglePhoto);
    this.auth.setPhone(this.phone.trim() || undefined);
    this.auth.setNotifyBy(this.notifyBy);
    try {
      await this.http.post(
        'https://6ma4vxkx0g.execute-api.us-east-1.amazonaws.com/dev/save-profile',
        {
          userId:         this.user.userId,
          ownerSub:       this.user.userId,
          email:          this.user.email?.toLowerCase(),
          googlePhotoUrl: this.user.photoURL || null,
          useGooglePhoto: this.useGooglePhoto,
          playerName:     this.selectedPlayer?.name     || null,
          playerTeam:     this.selectedPlayer?.team     || null,
          playerPosition: this.selectedPlayer?.position || null,
          playerImageUrl: this.selectedPlayer?.imagePath || null,
          phone:          this.phone.trim() || null,
          notifyBy:       this.notifyBy,
        },
        { headers: { 'Content-Type': 'application/json' } }
      ).toPromise();
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
    this.editing = false;
  }

  cancelEdit(): void {
    this.editing = false;
    this.filterName = '';
    this.filterTeam = '';
    this.filterPosition = '';
    this.selectedPlayer = null;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
