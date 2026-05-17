import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { OccasionService } from '../../services/occasion.service';
import { AuthService } from '../../services/auth.service';
import { Occasion } from '../../models/occasion.model';

@Component({
  selector: 'app-occasion-list',
  templateUrl: './occasion-list.component.html',
  styleUrls: ['./occasion-list.component.scss'],
})
export class OccasionListComponent implements OnInit, OnDestroy {
  occasions: Occasion[] = [];
  userEmail = '';
  private sub: Subscription | undefined;

  constructor(
    private svc: OccasionService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.auth.user$.pipe(
      switchMap(user => {
        this.userEmail = user?.email ?? '';
        return this.svc.getAccessibleOccasions(this.userEmail);
      })
    ).subscribe(o => (this.occasions = o));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  open(id: string): void {
    this.router.navigate(['/occasion', id]);
  }

  create(): void {
    this.router.navigate(['/occasion/new']);
  }

  isOwner(o: Occasion): boolean {
    return o.ownerEmail?.toLowerCase() === this.userEmail.toLowerCase();
  }

  deleteOccasion(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Delete this occasion?')) {
      this.svc.delete(id);
    }
  }

  statusColor(status: string): string {
    return status === 'finalized' ? 'accent' : status === 'polling' ? 'primary' : 'warn';
  }
}
