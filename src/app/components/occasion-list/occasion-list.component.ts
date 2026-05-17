import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, filter, take } from 'rxjs/operators';
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
  loading = true;
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
        this.loading = true;
        return this.svc.loaded.pipe(
          filter(loaded => loaded),
          take(1),
          switchMap(() => this.svc.getAccessibleOccasions(this.userEmail))
        );
      })
    ).subscribe(o => {
      this.occasions = o;
      this.loading = false;
    });
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

  respondentsVoted(o: Occasion): number {
    const voterIds = new Set<string>();
    for (const opt of [...o.whenOptions, ...o.whereOptions]) {
      for (const v of opt.votes) {
        voterIds.add(v.voterId ?? v.voter);
      }
    }
    return o.respondents.filter(r =>
      voterIds.has(r.email) || voterIds.has(r.name)
    ).length;
  }
}
