import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap } from 'rxjs/operators';
import { OccasionService } from '../../services/occasion.service';
import { AuthService } from '../../services/auth.service';
import { Occasion, WhenOption, Respondent, VoteResponse, Vote, OccasionType, OCCASION_TYPES } from '../../models/occasion.model';

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
  private allOccasions: Occasion[] = [];
  voterName = '';
  userEmail = '';
  selectedTab = 0;
  calendarMonth: Date = new Date();
  whenView: 'list' | 'calendar' = 'list';

  // When form
  newWhenDate: Date | null = null;
  newWhenStart = '18:00';
  newWhenEnd = '20:00';

  // Where form
  newWhereOption = '';
  newWhereUrl = '';

  // Where edit
  editingWhereId: string | null = null;
  editWhereLabel = '';
  editWhereUrl = '';

  // Respondent form
  newRespondentName = '';
  newRespondentEmail = '';

  // Edit occasion form
  editing = false;
  editTitle = '';
  editDescription = '';
  editOccasionType: OccasionType | '' = '';
  readonly occasionTypes = OCCASION_TYPES;

  // Copy occasion
  showCopyPanel = false;
  copyIncludeWhen = true;
  copyIncludeWhere = true;
  copyIncludeWho = true;
  copying = false;

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
    const openEdit = this.route.snapshot.queryParamMap.get('edit') === 'true';
    this.auth.user$.pipe(
      filter(user => !!user),
      switchMap(user => {
        this.voterName = user!.displayName || user!.email || '';
        this.userEmail = user!.email ?? '';
        return this.svc.getOccasions();
      })
    ).subscribe(occasions => {
      const found = occasions.find(o => o.id === id);
      if (found && !this.svc.canAccess(found, this.userEmail)) {
        this.router.navigate(['/']);
        return;
      }
      if (!found) {
        if (this.occasion) this.router.navigate(['/']);
        return;
      }
      this.allOccasions = occasions;
      const isFirst = !this.occasion;
      this.occasion = found;
      if (isFirst) {
        this.jumpToFirstOption();
        if (openEdit) this.startEdit();
      }
      this.syncVoteState();
    });
  }

  private syncVoteState(): void {
    if (!this.occasion) return;
    const id = this.userEmail;
    for (const opt of this.occasion.whenOptions) {
      const existing = opt.votes.find(v => (v.voterId ?? v.voter) === id);
      const local = this.whenVotes[opt.id];
      const serverResponse = existing?.response ?? null;
      const serverComment  = existing?.comment  ?? '';
      if (!local || local.response === serverResponse) {
        this.whenVotes[opt.id] = { response: serverResponse, comment: serverComment };
      }
    }
    for (const opt of this.occasion.whereOptions) {
      const existing = opt.votes.find(v => (v.voterId ?? v.voter) === id);
      const local = this.whereVotes[opt.id];
      const serverResponse = existing?.response ?? null;
      const serverComment  = existing?.comment  ?? '';
      if (!local || local.response === serverResponse) {
        this.whereVotes[opt.id] = { response: serverResponse, comment: serverComment };
      }
    }
  }

  fmtTime(t: string): string {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  isOwner(): boolean {
    if (!this.occasion) return false;
    return this.occasion.ownerEmail?.toLowerCase() === this.userEmail.toLowerCase();
  }

  canEdit(): boolean {
    if (!this.occasion) return false;
    if (this.isOwner()) return true;
    return this.occasion.respondents.some(
      r => r.email.toLowerCase() === this.userEmail.toLowerCase() && r.coOrganizer
    );
  }

  // ---------- Edit occasion ----------
  startEdit(): void {
    if (!this.occasion) return;
    this.editTitle = this.occasion.title;
    this.editDescription = this.occasion.description;
    this.editOccasionType = this.occasion.occasionType ?? '';
    this.editing = true;
  }

  saveEdit(): void {
    if (!this.occasion || !this.editTitle.trim()) return;
    this.svc.updateDetails(this.occasion.id, this.editTitle.trim(), this.editDescription.trim());
    this.svc.updateType(this.occasion.id, this.editOccasionType as OccasionType || undefined);
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

  fmt12(t: string): string {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  // ---------- Calendar ----------
  readonly weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  calendarDays(): Array<{ date: Date | null; options: WhenOption[] }> {
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date | null; options: WhenOption[] }> = [];
    for (let i = 0; i < firstDay; i++) cells.push({ date: null, options: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const iso = date.toISOString().split('T')[0];
      const options = (this.occasion?.whenOptions ?? []).filter(o => o.date === iso);
      cells.push({ date, options });
    }
    return cells;
  }

  calendarMonthLabel(): string {
    return this.calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  prevMonth(): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() - 1, 1);
  }

  nextMonth(): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + 1, 1);
  }

  jumpToFirstOption(): void {
    if (!this.occasion?.whenOptions.length) return;
    const earliest = this.occasion.whenOptions.map(o => o.date).sort()[0];
    const d = new Date(earliest + 'T00:00:00');
    this.calendarMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  }

  // ---------- Where options ----------
  removeWhenOption(optionId: string): void {
    if (!this.occasion) return;
    this.svc.removeWhenOption(this.occasion.id, optionId);
  }

  removeWhereOption(optionId: string): void {
    if (!this.occasion) return;
    this.svc.removeWhereOption(this.occasion.id, optionId);
  }

  addWhereOption(): void {
    if (!this.occasion || !this.newWhereOption.trim()) return;
    this.svc.addWhereOption(this.occasion.id, this.newWhereOption.trim(), this.newWhereUrl.trim());
    this.newWhereOption = '';
    this.newWhereUrl = '';
  }

  startEditWhere(opt: { id: string; label: string; url?: string }): void {
    this.editingWhereId = opt.id;
    this.editWhereLabel = opt.label;
    this.editWhereUrl = opt.url ?? '';
  }

  saveEditWhere(): void {
    if (!this.occasion || !this.editingWhereId || !this.editWhereLabel.trim()) return;
    this.svc.updateWhereOption(this.occasion.id, this.editingWhereId, this.editWhereLabel.trim(), this.editWhereUrl.trim());
    this.editingWhereId = null;
  }

  cancelEditWhere(): void {
    this.editingWhereId = null;
  }

  getDomain(url: string): string {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
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
    if (!this.occasion || !this.userEmail) return;
    const state = this.whenVotes[optionId];
    if (!state?.response) {
      this.svc.clearWhenVote(this.occasion.id, optionId, this.userEmail);
    } else {
      this.svc.castWhenVote(this.occasion.id, optionId, this.voterName || this.userEmail, this.userEmail, state.response, state.comment);
    }
  }

  saveWhereVote(optionId: string): void {
    if (!this.occasion || !this.userEmail) return;
    const state = this.whereVotes[optionId];
    if (!state?.response) {
      this.svc.clearWhereVote(this.occasion.id, optionId, this.userEmail);
    } else {
      this.svc.castWhereVote(this.occasion.id, optionId, this.voterName || this.userEmail, this.userEmail, state.response, state.comment);
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

  get sortedWhenOptions(): WhenOption[] {
    return [...(this.occasion?.whenOptions ?? [])].sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      return d !== 0 ? d : a.startTime.localeCompare(b.startTime);
    });
  }

  isLeadingWhen(opt: WhenOption): boolean {
    return this.optionScore(opt.votes) > 0 && this.optionScore(opt.votes) === this.maxWhenScore();
  }

  isLeadingWhere(opt: { votes: Vote[] }): boolean {
    return this.optionScore(opt.votes) > 0 && this.optionScore(opt.votes) === this.maxWhereScore();
  }

  get pastRespondentSuggestions(): Respondent[] {
    if (!this.occasion) return [];
    const currentEmails = new Set(this.occasion.respondents.map(r => r.email.toLowerCase()));
    const seen = new Set<string>();
    const suggestions: Respondent[] = [];
    for (const occ of this.allOccasions) {
      if (occ.id === this.occasion.id) continue;
      for (const r of occ.respondents) {
        const key = r.email.toLowerCase();
        if (!currentEmails.has(key) && !seen.has(key)) {
          seen.add(key);
          suggestions.push(r);
        }
      }
    }
    return suggestions;
  }

  // ---------- Respondents ----------
  addRespondent(): void {
    if (!this.occasion || !this.newRespondentName.trim() || !this.newRespondentEmail.trim()) return;
    this.svc.addRespondent(this.occasion.id, this.newRespondentName.trim(), this.newRespondentEmail.trim());
    this.newRespondentName = '';
    this.newRespondentEmail = '';
  }

  copyEmails(): void {
    const emails = (this.occasion?.respondents ?? []).map(r => r.email).join(';');
    navigator.clipboard.writeText(emails);
  }

  addSuggestedRespondent(r: Respondent): void {
    if (!this.occasion) return;
    this.svc.addRespondent(this.occasion.id, r.name, r.email);
  }

  toggleCoOrganizer(r: Respondent): void {
    if (!this.occasion) return;
    this.svc.setCoOrganizer(this.occasion.id, r.id, !r.coOrganizer);
  }

  removeRespondent(r: Respondent): void {
    if (!this.occasion || this.isOwnerRespondent(r)) return;
    this.svc.removeRespondent(this.occasion.id, r.id);
  }

  isOwnerRespondent(r: Respondent): boolean {
    return r.email.toLowerCase() === this.occasion?.ownerEmail?.toLowerCase();
  }

  respondentVotedWhen(r: Respondent): boolean {
    return this.occasion?.whenOptions.some(o => o.votes.some(v => (v.voterId ?? v.voter) === r.email)) ?? false;
  }

  respondentVotedWhere(r: Respondent): boolean {
    return this.occasion?.whereOptions.some(o => o.votes.some(v => (v.voterId ?? v.voter) === r.email)) ?? false;
  }

  respondentVoteCounts(r: Respondent): {
    when: { yes: number; maybe: number; no: number };
    where: { yes: number; maybe: number; no: number };
  } {
    const tally = (votes: Vote[]) => ({
      yes:   votes.filter(v => v.response === 'yes').length,
      maybe: votes.filter(v => v.response === 'maybe').length,
      no:    votes.filter(v => v.response === 'no').length,
    });
    const whenVotes  = (this.occasion?.whenOptions  ?? []).flatMap(o => o.votes).filter(v => (v.voterId ?? v.voter) === r.email);
    const whereVotes = (this.occasion?.whereOptions ?? []).flatMap(o => o.votes).filter(v => (v.voterId ?? v.voter) === r.email);
    return { when: tally(whenVotes), where: tally(whereVotes) };
  }

  // ---------- Copy ----------
  async confirmCopy(): Promise<void> {
    if (!this.occasion) return;
    this.copying = true;
    const user = this.auth.getCurrentUser();
    try {
      const copy = await this.svc.copyOccasion(
        this.occasion,
        user?.displayName || user?.email || '',
        user?.email || '',
        user?.userId || '',
        this.copyIncludeWhen,
        this.copyIncludeWhere,
        this.copyIncludeWho
      );
      await this.router.navigate(['/']);
      this.router.navigate(['/occasion', copy.id], { queryParams: { edit: 'true' } });
    } finally {
      this.copying = false;
      this.showCopyPanel = false;
    }
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
