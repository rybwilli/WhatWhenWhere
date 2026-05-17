import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { OccasionService } from '../../services/occasion.service';
import { AuthService } from '../../services/auth.service';
import { Occasion, WhenOption, Respondent, VoteResponse, Vote } from '../../models/occasion.model';

interface VoteState {
  response: VoteResponse | null;
  comment: string;
}

@Component({
  selector: 'app-occasion-detail',
  templateUrl: './occasion-detail.component.html',
  styleUrls: ['./occasion-detail.component.scss'],
})
export class OccasionDetailComponent implements OnInit {
  occasion: Occasion | undefined;
  voterName = '';
  userEmail = '';

  // When form
  newWhenDate: Date | null = null;
  newWhenStart = '18:00';
  newWhenEnd = '20:00';

  // Where form
  newWhereOption = '';

  // Respondent form
  newRespondentName = '';
  newRespondentEmail = '';

  // Edit occasion form
  editing = false;
  editTitle = '';
  editDescription = '';

  // Vote state keyed by optionId
  whenVotes: Record<string, VoteState> = {};
  whereVotes: Record<string, VoteState> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: OccasionService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.auth.user$.pipe(
      switchMap(user => {
        this.voterName = user?.displayName || user?.email || '';
        this.userEmail = user?.email ?? '';
        return this.svc.getOccasions();
      })
    ).subscribe(occasions => {
      const found = occasions.find(o => o.id === id);
      if (!found || !this.svc.canAccess(found, this.userEmail)) {
        this.router.navigate(['/']);
        return;
      }
      this.occasion = found;
      this.syncVoteState();
    });
  }

  private syncVoteState(): void {
    if (!this.occasion) return;
    const name = this.voterName;
    for (const opt of this.occasion.whenOptions) {
      const existing = opt.votes.find(v => v.voter === name);
      const local = this.whenVotes[opt.id];
      const serverResponse = existing?.response ?? null;
      const serverComment  = existing?.comment  ?? '';
      // Always sync unless the user has made a local change not yet saved to server.
      // A local change is in-flight when the local response differs from what's on server.
      if (!local || local.response === serverResponse) {
        this.whenVotes[opt.id] = { response: serverResponse, comment: serverComment };
      }
    }
    for (const opt of this.occasion.whereOptions) {
      const existing = opt.votes.find(v => v.voter === name);
      const local = this.whereVotes[opt.id];
      const serverResponse = existing?.response ?? null;
      const serverComment  = existing?.comment  ?? '';
      if (!local || local.response === serverResponse) {
        this.whereVotes[opt.id] = { response: serverResponse, comment: serverComment };
      }
    }
  }

  isOwner(): boolean {
    if (!this.occasion) return false;
    return this.occasion.ownerEmail?.toLowerCase() === this.userEmail.toLowerCase();
  }

  // ---------- Edit occasion ----------
  startEdit(): void {
    if (!this.occasion) return;
    this.editTitle = this.occasion.title;
    this.editDescription = this.occasion.description;
    this.editing = true;
  }

  saveEdit(): void {
    if (!this.occasion || !this.editTitle.trim()) return;
    this.svc.updateDetails(this.occasion.id, this.editTitle.trim(), this.editDescription.trim());
    this.editing = false;
  }

  cancelEdit(): void { this.editing = false; }

  // ---------- Polling ----------
  openPolling(): void {
    if (this.occasion) this.svc.openPolling(this.occasion.id);
  }

  // ---------- When options ----------
  canAddWhen(): boolean {
    return !!(this.newWhenDate && this.newWhenStart && this.newWhenEnd);
  }

  addWhenOption(): void {
    if (!this.occasion || !this.canAddWhen()) return;
    const iso = this.newWhenDate!.toISOString().split('T')[0];
    this.svc.addWhenOption(this.occasion.id, iso, this.newWhenStart, this.newWhenEnd);
    this.newWhenDate = null;
    this.newWhenStart = '18:00';
    this.newWhenEnd = '20:00';
  }

  formatWhen(opt: WhenOption): string {
    const date = new Date(opt.date + 'T00:00:00');
    const datePart = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return `${datePart}  ·  ${this.fmt12(opt.startTime)} – ${this.fmt12(opt.endTime)}`;
  }

  private fmt12(t: string): string {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  // ---------- Where options ----------
  addWhereOption(): void {
    if (!this.occasion || !this.newWhereOption.trim()) return;
    this.svc.addWhereOption(this.occasion.id, this.newWhereOption.trim());
    this.newWhereOption = '';
  }

  // ---------- Voting ----------
  setWhenVote(optionId: string, response: VoteResponse): void {
    if (!this.whenVotes[optionId]) this.whenVotes[optionId] = { response: null, comment: '' };
    const state = this.whenVotes[optionId];
    // toggle off if same
    state.response = state.response === response ? null : response;
    this.saveWhenVote(optionId);
  }

  setWhereVote(optionId: string, response: VoteResponse): void {
    if (!this.whereVotes[optionId]) this.whereVotes[optionId] = { response: null, comment: '' };
    const state = this.whereVotes[optionId];
    state.response = state.response === response ? null : response;
    this.saveWhereVote(optionId);
  }

  saveWhenVote(optionId: string): void {
    if (!this.occasion || !this.voterName.trim()) return;
    const state = this.whenVotes[optionId];
    if (!state?.response) {
      this.svc.clearWhenVote(this.occasion.id, optionId, this.voterName);
    } else {
      this.svc.castWhenVote(this.occasion.id, optionId, this.voterName, state.response, state.comment);
    }
  }

  saveWhereVote(optionId: string): void {
    if (!this.occasion || !this.voterName.trim()) return;
    const state = this.whereVotes[optionId];
    if (!state?.response) {
      this.svc.clearWhereVote(this.occasion.id, optionId, this.voterName);
    } else {
      this.svc.castWhereVote(this.occasion.id, optionId, this.voterName, state.response, state.comment);
    }
  }

  myWhenVote(optionId: string): VoteResponse | null {
    return this.whenVotes[optionId]?.response ?? null;
  }

  myWhereVote(optionId: string): VoteResponse | null {
    return this.whereVotes[optionId]?.response ?? null;
  }

  votesFor(votes: Vote[], response: VoteResponse): Vote[] {
    return votes.filter(v => v.response === response);
  }

  maxWhenScore(): number {
    if (!this.occasion?.whenOptions.length) return 0;
    return Math.max(...this.occasion.whenOptions.map(o => this.optionScore(o.votes)));
  }

  maxWhereScore(): number {
    if (!this.occasion?.whereOptions.length) return 0;
    return Math.max(...this.occasion.whereOptions.map(o => this.optionScore(o.votes)));
  }

  optionScore(votes: Vote[]): number {
    return votes.filter(v => v.response === 'yes').length * 2 +
           votes.filter(v => v.response === 'maybe').length;
  }

  isLeadingWhen(opt: WhenOption): boolean {
    return this.optionScore(opt.votes) > 0 && this.optionScore(opt.votes) === this.maxWhenScore();
  }

  isLeadingWhere(opt: { votes: Vote[] }): boolean {
    return this.optionScore(opt.votes) > 0 && this.optionScore(opt.votes) === this.maxWhereScore();
  }

  // ---------- Respondents ----------
  addRespondent(): void {
    if (!this.occasion || !this.newRespondentName.trim() || !this.newRespondentEmail.trim()) return;
    this.svc.addRespondent(this.occasion.id, this.newRespondentName.trim(), this.newRespondentEmail.trim());
    this.newRespondentName = '';
    this.newRespondentEmail = '';
  }

  removeRespondent(r: Respondent): void {
    if (!this.occasion || this.isOwnerRespondent(r)) return;
    this.svc.removeRespondent(this.occasion.id, r.id);
  }

  isOwnerRespondent(r: Respondent): boolean {
    return r.email.toLowerCase() === this.occasion?.ownerEmail?.toLowerCase();
  }

  respondentVotedWhen(r: Respondent): boolean {
    return this.occasion?.whenOptions.some(o => o.votes.some(v => v.voter === r.name)) ?? false;
  }

  respondentVotedWhere(r: Respondent): boolean {
    return this.occasion?.whereOptions.some(o => o.votes.some(v => v.voter === r.name)) ?? false;
  }

  // ---------- Navigation ----------
  goFinalize(): void { this.router.navigate(['/occasion', this.occasion!.id, 'finalize']); }
  goBack(): void { this.router.navigate(['/']); }

  delete(): void {
    if (this.occasion && confirm('Delete this occasion?')) {
      this.svc.delete(this.occasion.id);
      this.router.navigate(['/']);
    }
  }
}
