import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, filter, take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { OccasionService } from '../../services/occasion.service';
import { AuthService } from '../../services/auth.service';
import { Occasion, OCCASION_TYPES } from '../../models/occasion.model';

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

  filterStatus = '';
  filterStartDate: Date | null = new Date();
  filterEndDate: Date | null = null;
  filterTypes: string[] = [];
  readonly occasionTypes = OCCASION_TYPES;
  showMobileFilters = false;

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

  occasionDate(o: Occasion): string {
    if (o.status === 'finalized' && o.finalDate) return o.finalDate;
    const dates = o.whenOptions.map(w => w.date).filter(Boolean).sort();
    return dates.length ? dates[dates.length - 1] : '';
  }

  sortDate(o: Occasion): string {
    if (o.status === 'finalized' && o.finalDate) return o.finalDate;
    const dates = o.whenOptions.map(w => w.date).filter(Boolean).sort();
    return dates.length ? dates[0] : '9999-99-99';
  }

  get filteredOccasions(): Occasion[] {
    const startIso = this.filterStartDate ? this.filterStartDate.toISOString().split('T')[0] : '';
    const endIso   = this.filterEndDate   ? this.filterEndDate.toISOString().split('T')[0]   : '';
    return this.occasions
      .filter(o => {
        if (this.filterStatus && o.status !== this.filterStatus) return false;
        if (this.filterTypes.length && !this.filterTypes.includes(o.occasionType ?? '')) return false;
        const date = this.occasionDate(o);
        if (startIso && date && date < startIso) return false;
        if (endIso   && date && date > endIso)   return false;
        return true;
      })
      .sort((a, b) => this.sortDate(a).localeCompare(this.sortDate(b)));
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterTypes = [];
    this.filterStartDate = new Date();
    this.filterEndDate = null;
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
