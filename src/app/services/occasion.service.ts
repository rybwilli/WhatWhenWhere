import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/api';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import * as subs from '../../graphql/subscriptions';
import { Occasion, OccasionType, Respondent, VoteResponse } from '../models/occasion.model';

const client = generateClient();

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
  finalLocation?: string | null;
  finalNotes?: string | null;
  infoText?: string | null;
  infoUrl?: string | null;
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
    finalLocation: r.finalLocation ?? undefined,
    finalNotes: r.finalNotes ?? undefined,
    infoText: r.infoText ?? undefined,
    infoUrl: r.infoUrl ?? undefined,
    createdAt: r.createdAt || new Date().toISOString(),
  };
}

@Injectable({ providedIn: 'root' })
export class OccasionService {
  private occasions$ = new BehaviorSubject<Occasion[]>([]);
  private loaded$ = new BehaviorSubject<boolean>(false);
  readonly loaded = this.loaded$.asObservable();

  constructor() {
    this.fetchAll();
    this.subscribeRealtime();
  }

  private async fetchAll(): Promise<void> {
    try {
      const res: any = await (client.graphql as any)({ query: queries.listOccasions });
      const items: OccasionRecord[] = res.data.listOccasions.items ?? [];
      this.occasions$.next(items.map(fromRecord));
    } catch (e) {
      console.error('fetchAll failed', e);
    } finally {
      this.loaded$.next(true);
    }
  }

  private subscribeRealtime(): void {
    const handle = (obs: any) =>
      obs.subscribe({ next: () => this.fetchAll(), error: console.error });
    handle((client.graphql as any)({ query: subs.onCreateOccasion }));
    handle((client.graphql as any)({ query: subs.onUpdateOccasion }));
    handle((client.graphql as any)({ query: subs.onDeleteOccasion }));
  }

  getOccasions(): Observable<Occasion[]> {
    return this.occasions$.asObservable();
  }

  getAccessibleOccasions(userEmail: string): Observable<Occasion[]> {
    const email = userEmail.toLowerCase();
    return this.occasions$.pipe(
      map(all => all.filter(o =>
        o.ownerEmail?.toLowerCase() === email ||
        o.respondents.some(r => r.email.toLowerCase() === email)
      ))
    );
  }

  canAccess(occasion: Occasion, userEmail: string): boolean {
    const email = userEmail.toLowerCase();
    return occasion.ownerEmail?.toLowerCase() === email ||
      occasion.respondents.some(r => r.email.toLowerCase() === email);
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
    const res: any = await (client.graphql as any)({ query: mutations.createOccasion, variables: { input } });
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
    const res: any = await (client.graphql as any)({ query: mutations.createOccasion, variables: { input } });
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
    if (changes.finalDate      !== undefined) input.finalDate      = changes.finalDate;
    if (changes.finalStartTime !== undefined) input.finalStartTime = changes.finalStartTime;
    if (changes.finalEndTime   !== undefined) input.finalEndTime   = changes.finalEndTime;
    if (changes.finalLocation  !== undefined) input.finalLocation  = changes.finalLocation;
    if (changes.finalNotes     !== undefined) input.finalNotes     = changes.finalNotes;
    if (changes.infoText       !== undefined) input.infoText       = changes.infoText;
    if (changes.infoUrl        !== undefined) input.infoUrl        = changes.infoUrl;

    await (client.graphql as any)({ query: mutations.updateOccasion, variables: { input } });
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

  addWhenOption(id: string, date: string, startTime: string, endTime: string): void {
    this.updateFields(id, o => ({
      whenOptions: [...o.whenOptions, { id: uuid(), date, startTime, endTime, votes: [] }],
    }));
  }

  addWhereOption(id: string, label: string, url?: string): void {
    this.updateFields(id, o => ({
      whereOptions: [...o.whereOptions, { id: uuid(), label, url: url || undefined, votes: [] }],
    }));
  }

  updateWhereOption(id: string, optionId: string, label: string, url?: string): void {
    this.updateFields(id, o => ({
      whereOptions: o.whereOptions.map(opt =>
        opt.id !== optionId ? opt : { ...opt, label, url: url || undefined }
      ),
    }));
  }

  castWhenVote(id: string, optionId: string, voter: string, voterId: string, response: VoteResponse, comment: string): void {
    this.updateFields(id, o => ({
      whenOptions: o.whenOptions.map(opt =>
        opt.id !== optionId ? opt : {
          ...opt,
          votes: [
            ...opt.votes.filter(v => (v.voterId ?? v.voter) !== voterId),
            { voter, voterId, response, comment: comment.trim() || undefined },
          ],
        }
      ),
    }));
  }

  castWhereVote(id: string, optionId: string, voter: string, voterId: string, response: VoteResponse, comment: string): void {
    this.updateFields(id, o => ({
      whereOptions: o.whereOptions.map(opt =>
        opt.id !== optionId ? opt : {
          ...opt,
          votes: [
            ...opt.votes.filter(v => (v.voterId ?? v.voter) !== voterId),
            { voter, voterId, response, comment: comment.trim() || undefined },
          ],
        }
      ),
    }));
  }

  clearWhenVote(id: string, optionId: string, voterId: string): void {
    this.updateFields(id, o => ({
      whenOptions: o.whenOptions.map(opt =>
        opt.id !== optionId ? opt : { ...opt, votes: opt.votes.filter(v => (v.voterId ?? v.voter) !== voterId) }
      ),
    }));
  }

  clearWhereVote(id: string, optionId: string, voterId: string): void {
    this.updateFields(id, o => ({
      whereOptions: o.whereOptions.map(opt =>
        opt.id !== optionId ? opt : { ...opt, votes: opt.votes.filter(v => (v.voterId ?? v.voter) !== voterId) }
      ),
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
      finalLocation: '',
      finalNotes: '',
    }));
  }

  finalize(id: string, finalDate: string, finalStartTime: string, finalEndTime: string, finalLocation: string, finalNotes: string): void {
    this.updateFields(id, () => ({ status: 'finalized', finalDate, finalStartTime, finalEndTime, finalLocation, finalNotes }));
  }

  async delete(id: string): Promise<void> {
    this.occasions$.next(this.occasions$.value.filter(o => o.id !== id));
    await (client.graphql as any)({ query: mutations.deleteOccasion, variables: { input: { id } } });
  }
}
