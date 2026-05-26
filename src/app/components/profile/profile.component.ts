import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AppUser } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: AppUser | null = null;
  editing = false;
  saving = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      this.user = user;
    });
  }

  startEdit(): void {
    this.editing = true;
    this.error = '';
  }

  cancelEdit(): void {
    this.editing = false;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
