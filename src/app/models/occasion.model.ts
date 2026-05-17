export type OccasionStatus = 'draft' | 'polling' | 'finalized';
export type VoteResponse = 'yes' | 'maybe' | 'no';

export interface Vote {
  voter: string;    // display name
  voterId: string;  // email — unique key for deduplication
  response: VoteResponse;
  comment?: string;
}

export interface WhenOption {
  id: string;
  date: string;      // ISO date e.g. "2026-06-14"
  startTime: string; // 24h e.g. "19:00"
  endTime: string;   // 24h e.g. "21:00"
  votes: Vote[];
}

export interface WhereOption {
  id: string;
  label: string;
  url?: string;
  votes: Vote[];
}

export interface Respondent {
  id: string;
  name: string;
  email: string;
}

export interface Occasion {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  status: OccasionStatus;
  respondents: Respondent[];
  whenOptions: WhenOption[];
  whereOptions: WhereOption[];
  finalDate?: string;
  finalLocation?: string;
  finalNotes?: string;
  createdAt: string;
}
