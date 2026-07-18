export type OccasionStatus = 'draft' | 'polling' | 'finalized' | 'closed';
export type OccasionType = 'Rehearsal' | 'Performance' | 'Meeting' | 'Party' | 'Ride' | 'Run' | 'Practice' | 'Pick Up Game' | 'Lecture';
export const OCCASION_TYPES: OccasionType[] = ['Rehearsal', 'Performance', 'Meeting', 'Party', 'Ride', 'Run', 'Practice', 'Pick Up Game', 'Lecture'];
export type VoteResponse = 'yes' | 'maybe' | 'no';

export interface PlayerOfDayVote {
  voterId: string;
  voter: string;
  votedForId: string;
  votedForName: string;
  timestamp: string;
}

export interface Vote {
  voter: string;    // display name
  voterId: string;  // email — unique key for deduplication
  response: VoteResponse;
  comment?: string;
  timestamp?: string;
}

export interface WhenOption {
  id: string;
  date: string;       // ISO date e.g. "2026-06-14"
  startTime: string;  // 24h e.g. "19:00"
  endTime: string;    // 24h e.g. "21:00"
  endDate?: string;   // ISO date if end falls on a different day
  notes?: string;
  votes: Vote[];
}

export interface WhereOption {
  id: string;
  label: string;
  url?: string;
  notes?: string;
  votes: Vote[];
}

export interface Respondent {
  id: string;
  name: string;
  email: string;
  coOrganizer?: boolean;
}

export interface Occasion {
  id: string;
  title: string;
  description: string;
  occasionType?: OccasionType;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  status: OccasionStatus;
  respondents: Respondent[];
  whenOptions: WhenOption[];
  whereOptions: WhereOption[];
  finalDate?: string;
  finalStartTime?: string;
  finalEndTime?: string;
  finalEndDate?: string;
  finalLocation?: string;
  finalNotes?: string;
  infoText?: string;
  infoUrl?: string;
  allowPublic?: boolean;
  playerOfDayVotes?: PlayerOfDayVote[];
  playerOfDayDeadline?: string;
  createdAt: string;
}
