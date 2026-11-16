import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import * as subs from '../../graphql/subscriptions';
import { Occasion, OccasionType, Respondent, VoteResponse } from '../models/occasion.model';
import { AuthService } from './auth.service';

// Occasions are Cognito-only on the server (the API key can't reach them).
const client = generateClient({ authMode: 'userPool' });

// Queries and mutations go out with the Cognito ID token rather than the access
// token so the server-side access check can read the caller's email claim.
async function gql(query: string, variables?: Record<string, unknown>): Promise<any> {
  const session = await fetchAuthSession();
  const authToken = session.tokens?.idToken?.toString();
  return (client.graphql as any)({ query, variables, authMode: 'userPool', authToken });
}

/** Local calendar date as YYYY-MM-DD. */
export function toIsoDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** effectiveDate meaning "no lower bound". */
export const NO_EFFECTIVE_DATE = '0001-01-01';

export function defaultEffectiveDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 3);
  return toIsoDate(d);
}

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface OccasionRecord {
  id: string;
  ownerSub: string;
  ownerEmail: string;
  ownerName: string;
  title: string;
  description: string;
  status: string;
  occasionType?: string | null;
  respondents?: string | null;
  whenOptions?: string | null;
  whereOptions?: string | null;
  finalDate?: string | null;
  finalStartTime?: string | null;
  finalEndTime?: string | null;
  finalEndDate?: string | null;
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
  allowPublic?: boolean | null;
  playerOfDayVotes?: string | null;
  playerOfDayDeadline?: string | null;
  createdAt?: string;
}

function fromRecord(r: OccasionRecord): Occasion {
  return {
    id: r.id,
    ownerId: r.ownerSub,
    ownerEmail: r.ownerEmail,
    ownerName: r.ownerName,
    title: r.title,
    description: r.description,
    status: r.status as Occasion['status'],
    occasionType: r.occasionType as OccasionType ?? undefined,
    respondents: JSON.parse(r.respondents || '[]'),
    whenOptions: JSON.parse(r.whenOptions || '[]'),
    whereOptions: JSON.parse(r.whereOptions || '[]'),
    finalDate: r.finalDate ?? undefined,
    finalStartTime: r.finalStartTime ?? undefined,
    finalEndTime: r.finalEndTime ?? undefined,
    finalEndDate: r.finalEndDate ?? undefined,
    finalLocation: r.finalLocation ?? undefined,
    finalNotes: r.finalNotes ?? undefined,
    infoText: r.infoText ?? undefined,
    infoUrl: r.infoUrl ?? undefined,
    allowPublic: r.allowPublic ?? false,
    playerOfDayVotes: JSON.parse(r.playerOfDayVotes || '[]'),
    playerOfDayDeadline: r.playerOfDayDeadline ?? undefined,
    createdAt: r.createdAt || new Date().toISOString(),
  };
}

@Injectable({ providedIn: 'root' })
export class OccasionService {
  // Holds only what the server returned for the signed-in user: the occasions
  // listed for effectiveDate, plus any opened by id that the list left out.
  private occasions$ = new BehaviorSubject<Occasion[]>([]);
  private loaded$ = new BehaviorSubject<boolean>(false);
  readonly loaded = this.loaded$.asObservable();

  private effectiveDate = defaultEffectiveDate();
  // Occasions opened directly (e.g. a link to a past occasion) that the date
  // filter would leave out; kept in the list and refreshed by id.
  private pinnedIds = new Set<string>();
  // Pinned occasions the current list doesn't include; hidden from getOccasions().
  private pinnedOnlyIds = new Set<string>();
  private fetchSeq = 0;
  private realtime: Subscription[] = [];

  constructor(auth: AuthService) {
    let signedInAs: string | null = null;
    auth.user$.subscribe(user => {
      const id = user?.userId ?? null;
      if (id === signedInAs) return;
      signedInAs = id;
      this.stopRealtime();
      this.pinnedIds.clear();
      this.pinnedOnlyIds.clear();
      this.occasions$.next([]);
      this.loaded$.next(false);
      if (id) {
        this.fetchAll();
        this.subscribeRealtime();
      }
    });
  }

  /** Re-query the server for occasions on or after this date (YYYY-MM-DD). */
  setEffectiveDate(effectiveDate: string): void {
    if (effectiveDate === this.effectiveDate) return;
    this.effectiveDate = effectiveDate;
    this.fetchAll();
  }

  /** All accessible occasions for a date, without touching the shared list. */
  async listForDate(effectiveDate: string): Promise<Occasion[]> {
    const items: OccasionRecord[] = [];
    let nextToken: string | null = null;
    do {
      const res: any = await gql(queries.listOccasionsForUser, { effectiveDate, nextToken });
      const page = res.data.listOccasionsForUser;
      items.push(...(page.items ?? []));
      nextToken = page.nextToken ?? null;
    } while (nextToken);
    return items.map(fromRecord);
  }

  private async fetchAll(): Promise<void> {
    const seq = ++this.fetchSeq;
    const pinnedAtStart = new Set(this.pinnedIds);
    try {
      const listed = await this.listForDate(this.effectiveDate);
      const listedIds = new Set(listed.map(o => o.id));
      const pinned = await Promise.all(
        [...pinnedAtStart].filter(id => !listedIds.has(id)).map(id => this.fetchOne(id))
      );
      if (seq !== this.fetchSeq) return; // a newer fetch superseded this one
      const extra = pinned.filter((o): o is Occasion => !!o);
      // Keep occasions pinned (by ensureLoaded) while this fetch was in flight.
      extra.push(...this.occasions$.value.filter(o =>
        this.pinnedIds.has(o.id) && !pinnedAtStart.has(o.id) && !listedIds.has(o.id)
      ));
      this.pinnedOnlyIds = new Set(extra.map(o => o.id));
      this.occasions$.next([...listed, ...extra]);
    } catch (e) {
      console.error('fetchAll failed', e);
    } finally {
      if (seq === this.fetchSeq) this.loaded$.next(true);
    }
  }

  private subscribeRealtime(): void {
    const handle = (query: string) =>
      (client.graphql as any)({ query }).subscribe({ next: () => this.fetchAll(), error: console.error });
    this.realtime = [subs.onCreateOccasion, subs.onUpdateOccasion, subs.onDeleteOccasion].map(handle);
  }

  private stopRealtime(): void {
    this.realtime.forEach(s => s.unsubscribe());
    this.realtime = [];
  }

  /** The server-filtered list for the current effective date. */
  getOccasions(): Observable<Occasion[]> {
    return this.occasions$.pipe(map(all => all.filter(o => !this.pinnedOnlyIds.has(o.id))));
  }

  /** Live view of one loaded occasion (see ensureLoaded); undefined once gone. */
  watchOccasion(id: string): Observable<Occasion | undefined> {
    return this.occasions$.pipe(map(all => all.find(o => o.id === id)));
  }

  /**
   * Returns the occasion from the loaded list, or fetches it by id if the date
   * filter left it out. Resolves null when it doesn't exist or the server denies
   * access (the server enforces access; there is no client-side check).
   */
  async ensureLoaded(id: string): Promise<Occasion | null> {
    const existing = this.occasions$.value.find(o => o.id === id);
    if (existing) return existing;
    const fetched = await this.fetchOne(id);
    if (!fetched) return null;
    this.pinnedIds.add(id);
    if (!this.occasions$.value.some(o => o.id === id)) {
      this.pinnedOnlyIds.add(id);
      this.occasions$.next([...this.occasions$.value, fetched]);
    }
    return fetched;
  }

  private async fetchOne(id: string): Promise<Occasion | null> {
    try {
      const res: any = await gql(queries.getOccasion, { id });
      return res.data.getOccasion ? fromRecord(res.data.getOccasion) : null;
    } catch (e) {
      console.warn('getOccasion failed or was denied', id, e);
      return null;
    }
  }

  async create(
    title: string, description: string,
    ownerName: string, ownerEmail: string, ownerSub: string,
    occasionType?: string
  ): Promise<Occasion> {
    const input: any = {
      ownerSub,
      ownerEmail,
      ownerName,
      title,
      description,
      status: 'draft',
      occasionType: occasionType || null,
      respondents: JSON.stringify([{ id: uuid(), name: ownerName, email: ownerEmail }]),
      whenOptions: JSON.stringify([]),
      whereOptions: JSON.stringify([]),
    };
    const res: any = await gql(mutations.createOccasion, { input });
    const occasion = fromRecord(res.data.createOccasion);
    this.occasions$.next([...this.occasions$.value, occasion]);
    return occasion;
  }

  async copyOccasion(
    source: Occasion,
    ownerName: string, ownerEmail: string, ownerSub: string,
    includeWhen: boolean, includeWhere: boolean, includeWho: boolean
  ): Promise<Occasion> {
    const input = {
      ownerSub,
      ownerEmail,
      ownerName,
      title: `${source.title} (copy)`,
      description: source.description,
      status: 'draft',
      occasionType: source.occasionType || null,
      respondents: JSON.stringify(
        includeWho
          ? source.respondents.map(r => ({ ...r, id: uuid() }))
          : [{ id: uuid(), name: ownerName, email: ownerEmail }]
      ),
      whenOptions: JSON.stringify(
        includeWhen
          ? source.whenOptions.map(o => ({ ...o, id: uuid(), votes: [] }))
          : []
      ),
      whereOptions: JSON.stringify(
        includeWhere
          ? source.whereOptions.map(o => ({ ...o, id: uuid(), votes: [] }))
          : []
      ),
    };
    const res: any = await gql(mutations.createOccasion, { input });
    const copy = fromRecord(res.data.createOccasion);
    this.occasions$.next([...this.occasions$.value, copy]);
    return copy;
  }

  private async updateFields(occasionId: string, fn: (o: Occasion) => Partial<Occasion>): Promise<void> {
    const occasion = this.occasions$.value.find(o => o.id === occasionId);
    if (!occasion) return;
    const changes = fn(occasion);
    const updated = { ...occasion, ...changes };

    // Optimistic update
    this.occasions$.next(this.occasions$.value.map(o => o.id === occasionId ? updated : o));

    const input: any = { id: occasionId };
    if (changes.title         !== undefined) input.title         = changes.title;
    if (changes.description   !== undefined) input.description   = changes.description;
    if (changes.status        !== undefined) input.status        = changes.status;
    if (changes.occasionType  !== undefined) input.occasionType  = changes.occasionType ?? null;
    if (changes.respondents  !== undefined) input.respondents  = JSON.stringify(changes.respondents);
    if (changes.whenOptions  !== undefined) input.whenOptions  = JSON.stringify(changes.whenOptions);
    if (changes.whereOptions !== undefined) input.whereOptions = JSON.stringify(changes.whereOptions);
    if (changes.playerOfDayVotes !== undefined) input.playerOfDayVotes = JSON.stringify(changes.playerOfDayVotes);
    if (changes.finalDate      !== undefined) input.finalDate      = changes.finalDate;
    if (changes.finalStartTime !== undefined) input.finalStartTime = changes.finalStartTime;
    if (changes.finalEndTime   !== undefined) input.finalEndTime   = changes.finalEndTime;
    if (changes.finalEndDate   !== undefined) input.finalEndDate   = changes.finalEndDate;
    if (changes.finalLocation  !== undefined) input.finalLocation  = changes.finalLocation;
    if (changes.finalNotes     !== undefined) input.finalNotes     = changes.finalNotes;
    if (changes.infoText       !== undefined) input.infoText       = changes.infoText;
    if (changes.infoUrl        !== undefined) input.infoUrl        = changes.infoUrl;
    if (changes.allowPublic    !== undefined) input.allowPublic    = changes.allowPublic;
    if (changes.playerOfDayDeadline !== undefined) input.playerOfDayDeadline = changes.playerOfDayDeadline;

    await gql(mutations.updateOccasion, { input });
  }

  updateDetails(id: string, title: string, description: string): void {
    this.updateFields(id, () => ({ title, description }));
  }

  updateType(id: string, occasionType: OccasionType | undefined): void {
    this.updateFields(id, () => ({ occasionType }));
  }

  addRespondent(id: string, name: string, email: string): void {
    this.updateFields(id, o => ({
      respondents: [...o.respondents, { id: uuid(), name, email }],
    }));
  }

  removeRespondent(id: string, respondentId: string): void {
    this.updateFields(id, o => ({
      respondents: o.respondents.filter(r => r.id !== respondentId),
    }));
  }

  setCoOrganizer(id: string, respondentId: string, value: boolean): void {
    this.updateFields(id, o => ({
      respondents: o.respondents.map(r => r.id === respondentId ? { ...r, coOrganizer: value } : r),
    }));
  }

  removeWhenOption(id: string, optionId: string): void {
    this.updateFields(id, o => ({
      whenOptions: o.whenOptions.filter(opt => opt.id !== optionId),
    }));
  }

  removeWhereOption(id: string, optionId: string): void {
    this.updateFields(id, o => ({
      whereOptions: o.whereOptions.filter(opt => opt.id !== optionId),
    }));
  }

  addWhenOption(id: string, date: string, startTime: string, endTime: string, endDate?: string, notes?: string): void {
    this.updateFields(id, o => ({
      whenOptions: [...o.whenOptions, { id: uuid(), date, startTime, endTime, endDate: endDate || undefined, notes: notes || undefined, votes: [] }],
    }));
  }

  updateWhenOption(id: string, optionId: string, date: string, startTime: string, endTime: string, endDate?: string, notes?: string): void {
    this.updateFields(id, o => ({
      whenOptions: o.whenOptions.map(opt =>
        opt.id !== optionId ? opt : { ...opt, date, startTime, endTime, endDate: endDate || undefined, notes: notes || undefined }
      ),
    }));
  }

  addWhereOption(id: string, label: string, url?: string, notes?: string): void {
    this.updateFields(id, o => ({
      whereOptions: [...o.whereOptions, { id: uuid(), label, url: url || undefined, notes: notes || undefined, votes: [] }],
    }));
  }

  updateWhereOption(id: string, optionId: string, label: string, url?: string, notes?: string): void {
    this.updateFields(id, o => ({
      whereOptions: o.whereOptions.map(opt =>
        opt.id !== optionId ? opt : { ...opt, label, url: url || undefined, notes: notes || undefined }
      ),
    }));
  }

  async castWhenVote(id: string, optionId: string, voter: string, voterId: string, response: VoteResponse, comment: string): Promise<void> {
    await this.castVoteOnField(id, 'whenOptions', optionId, voterId, voter, response, comment);
  }

  async castWhereVote(id: string, optionId: string, voter: string, voterId: string, response: VoteResponse, comment: string): Promise<void> {
    await this.castVoteOnField(id, 'whereOptions', optionId, voterId, voter, response, comment);
  }

  async clearWhenVote(id: string, optionId: string, voterId: string): Promise<void> {
    await this.clearVoteOnField(id, 'whenOptions', optionId, voterId);
  }

  async clearWhereVote(id: string, optionId: string, voterId: string): Promise<void> {
    await this.clearVoteOnField(id, 'whereOptions', optionId, voterId);
  }

  private async castVoteOnField(
    occasionId: string, field: 'whenOptions' | 'whereOptions',
    optionId: string, voterId: string, voter: string, response: VoteResponse, comment: string
  ): Promise<void> {
    const fresh = await this.fetchFreshOccasion(occasionId);
    if (!fresh) return;
    const newOptions = fresh[field].map((opt: any) => {
      if (opt.id !== optionId) return opt;
      const existing = opt.votes.find((v: any) => (v.voterId ?? v.voter) === voterId);
      const timestamp = existing?.response === response ? existing.timestamp : new Date().toISOString();
      return {
        ...opt,
        votes: [
          ...opt.votes.filter((v: any) => (v.voterId ?? v.voter) !== voterId),
          { voter, voterId, response, comment: comment.trim() || undefined, timestamp },
        ],
      };
    });
    this.occasions$.next(this.occasions$.value.map(o =>
      o.id !== occasionId ? o : { ...o, [field]: newOptions }
    ));
    await gql(mutations.updateOccasion, {
      input: { id: occasionId, [field]: JSON.stringify(newOptions) }
    });
  }

  private async clearVoteOnField(
    occasionId: string, field: 'whenOptions' | 'whereOptions',
    optionId: string, voterId: string
  ): Promise<void> {
    const fresh = await this.fetchFreshOccasion(occasionId);
    if (!fresh) return;
    const newOptions = fresh[field].map((opt: any) =>
      opt.id !== optionId ? opt : {
        ...opt,
        votes: opt.votes.filter((v: any) => (v.voterId ?? v.voter) !== voterId),
      }
    );
    this.occasions$.next(this.occasions$.value.map(o =>
      o.id !== occasionId ? o : { ...o, [field]: newOptions }
    ));
    await gql(mutations.updateOccasion, {
      input: { id: occasionId, [field]: JSON.stringify(newOptions) }
    });
  }

  private fetchFreshOccasion(id: string): Promise<Occasion | null> {
    return this.fetchOne(id);
  }

  setAllowPublic(id: string, value: boolean): void {
    this.updateFields(id, () => ({ allowPublic: value }));
  }

  joinOccasion(id: string, name: string, email: string): void {
    this.updateFields(id, o => ({
      respondents: [...o.respondents, { id: Math.random().toString(36).slice(2) + Date.now().toString(36), name, email }],
    }));
  }

  saveInfo(id: string, infoText: string, infoUrl: string): void {
    this.updateFields(id, () => ({ infoText, infoUrl }));
  }

  openPolling(id: string): void {
    this.updateFields(id, () => ({ status: 'polling' }));
  }

  reopenPolling(id: string): void {
    this.updateFields(id, () => ({
      status: 'polling',
      finalDate: '',
      finalStartTime: '',
      finalEndTime: '',
      finalEndDate: '',
      finalLocation: '',
      finalNotes: '',
    }));
  }

  finalize(id: string, finalDate: string, finalStartTime: string, finalEndTime: string, finalEndDate: string, finalLocation: string, finalNotes: string): void {
    const occasion = this.occasions$.value.find(o => o.id === id);
    let deadline: string | undefined;
    if (occasion?.occasionType === 'Pick Up Game') {
      const endDate = finalEndDate && finalEndDate !== finalDate ? finalEndDate : finalDate;
      const endDateTime = new Date(`${endDate}T${finalEndTime}:00`);
      deadline = new Date(endDateTime.getTime() + 48 * 60 * 60 * 1000).toISOString();
    }
    this.updateFields(id, () => ({
      status: 'finalized',
      finalDate,
      finalStartTime,
      finalEndTime,
      finalEndDate,
      finalLocation,
      finalNotes,
      playerOfDayDeadline: deadline,
      playerOfDayVotes: []
    } as any));
  }

  closeOccasion(id: string): void {
    this.updateFields(id, () => ({ status: 'closed' }));
  }

  reopenOccasion(id: string): void {
    this.updateFields(id, () => ({ status: 'polling' }));
  }

  async voteForPlayerOfDay(occasionId: string, voterId: string, voter: string, votedForId: string, votedForName: string): Promise<void> {
    const fresh = await this.fetchFreshOccasion(occasionId);
    if (!fresh) return;
    const votes = [...(fresh.playerOfDayVotes || [])];
    const existingVoteIndex = votes.findIndex(v => v.voterId === voterId);
    const newVote = { voterId, voter, votedForId, votedForName, timestamp: new Date().toISOString() };
    if (existingVoteIndex >= 0) {
      votes[existingVoteIndex] = newVote;
    } else {
      votes.push(newVote);
    }
    this.occasions$.next(this.occasions$.value.map(o =>
      o.id !== occasionId ? o : { ...o, playerOfDayVotes: votes }
    ));
    await gql(mutations.updateOccasion, {
      input: { id: occasionId, playerOfDayVotes: JSON.stringify(votes) }
    });
  }

  isPlayerOfDayVotingOpen(occasion: Occasion): boolean {
    if (occasion.occasionType !== 'Pick Up Game' || occasion.status !== 'finalized') return false;

    let deadline = occasion.playerOfDayDeadline;
    if (!deadline && occasion.finalEndTime && occasion.finalDate) {
      const endDate = occasion.finalEndDate && occasion.finalEndDate !== occasion.finalDate
        ? occasion.finalEndDate
        : occasion.finalDate;
      const endDateTime = new Date(`${endDate}T${occasion.finalEndTime}:00`);
      deadline = new Date(endDateTime.getTime() + 48 * 60 * 60 * 1000).toISOString();
    }

    if (!deadline) return false;
    return new Date() < new Date(deadline);
  }

  getPlayerOfDayTally(votes: any[]): { name: string; id: string; count: number }[] {
    const tally: { [key: string]: { name: string; id: string; count: number } } = {};
    votes.forEach(v => {
      if (!tally[v.votedForId]) {
        tally[v.votedForId] = { id: v.votedForId, name: v.votedForName, count: 0 };
      }
      tally[v.votedForId].count++;
    });
    return Object.values(tally).sort((a, b) => b.count - a.count);
  }

  getUserPlayerOfDayVote(occasion: Occasion, userEmail: string): any {
    if (!occasion.playerOfDayVotes) return null;
    const email = userEmail.toLowerCase();
    return occasion.playerOfDayVotes.find(v => v.voterId === email);
  }

  async delete(id: string): Promise<void> {
    this.pinnedIds.delete(id);
    this.pinnedOnlyIds.delete(id);
    this.occasions$.next(this.occasions$.value.filter(o => o.id !== id));
    await gql(mutations.deleteOccasion, { input: { id } });
  }
}
