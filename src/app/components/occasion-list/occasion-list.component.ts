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

  private readonly subtitles = [
    'Plan occasions with your group',
    'Adventures await once you organize your ragtag bunch',
    'Herding cats has never been this organized',
    'Because someone has to plan the fun',
    'Get your crew together before everyone bails',
    'Turning "we should do something" into something',
    'Where group chats go to become real plans',
    'Nobody said organizing people was easy. We help anyway',
    'Your people are waiting. Make something happen',
    'Less "who\'s free when?" More actual plans',
    'Because "we should really do that sometime" deserves a date',
    'Making memories requires making plans first',
    'Your next great story starts with a date and a place',
    'Same group, better plans',
    'The world\'s okayest scheduling app for people who actually show up',
  ];
  subtitle = this.subtitles[0];
  subtitleFading = false;
  private subtitleTimer: ReturnType<typeof setInterval> | null = null;
  userEmail = '';
  loading = true;
  private sub: Subscription | undefined;

  filterStatus = '';
  filterVoteStatus = '';
  filterStartDate: Date | null = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    return d;
  })();
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
    this.subtitleTimer = setInterval(() => {
      this.subtitleFading = true;
      setTimeout(() => {
        const others = this.subtitles.filter(s => s !== this.subtitle);
        this.subtitle = others[Math.floor(Math.random() * others.length)];
        this.subtitleFading = false;
      }, 400);
    }, 4000);

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
    if (this.subtitleTimer) clearInterval(this.subtitleTimer);
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
        if (this.filterVoteStatus) {
          const vs = this.userVoteSummary(o);
          if (!vs) return false;
          const total = vs.whenTotal + vs.whereTotal;
          const voted = vs.when + vs.where;
          if (this.filterVoteStatus === 'pending'    && !(total > 0 && voted === 0)) return false;
          if (this.filterVoteStatus === 'incomplete' && !(voted > 0 && voted < total)) return false;
          if (this.filterVoteStatus === 'complete'   && !(total > 0 && voted === total)) return false;
        }
        const date = this.occasionDate(o);
        if (startIso && date && date < startIso) return false;
        if (endIso   && date && date > endIso)   return false;
        return true;
      })
      .sort((a, b) => this.sortDate(a).localeCompare(this.sortDate(b)));
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterVoteStatus = '';
    this.filterTypes = [];
    this.filterStartDate = new Date();
    this.filterEndDate = null;
  }

  userVoteSummary(o: Occasion): { when: number; whenTotal: number; where: number; whereTotal: number } | null {
    const email = this.userEmail.toLowerCase();
    if (!o.respondents.some(r => r.email.toLowerCase() === email)) return null;
    const voted = (opts: { votes: { voterId?: string; voter?: string }[] }[]) =>
      opts.filter(opt => opt.votes.some(v => (v.voterId ?? v.voter)?.toLowerCase() === email)).length;
    return {
      when: voted(o.whenOptions),
      whenTotal: o.whenOptions.length,
      where: voted(o.whereOptions),
      whereTotal: o.whereOptions.length,
    };
  }

  voteChipClass(when: number, whenTotal: number, where: number, whereTotal: number): string {
    const total = whenTotal + whereTotal;
    const voted = when + where;
    if (total === 0) return '';
    if (voted === 0) return 'vote-chip-none';
    if (voted < total) return 'vote-chip-partial';
    return 'vote-chip-complete';
  }

  fmtTime(t: string): string {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
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
