import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface NBAPlayer {
  name: string;
  team: string;
  position: string;
  headshot: string;
}

export interface Character {
  name: string;
  team: string;
  position: string;
  imagePath: string;
}

@Injectable({ providedIn: 'root' })
export class CharacterAvatarService {
  private players: Character[] = [];
  private loadPromise: Promise<void>;

  constructor(private http: HttpClient) {
    this.loadPromise = firstValueFrom(
      this.http.get<NBAPlayer[]>('assets/nba_players.json')
    ).then(data => {
      this.players = data.map(p => ({
        name: p.name,
        team: p.team,
        position: p.position,
        imagePath: p.headshot,
      }));
    }).catch(() => {});
  }

  async getRandomCharacter(): Promise<Character> {
    await this.loadPromise;
    if (!this.players.length) return { name: 'Player', team: '', position: '', imagePath: '' };
    return this.players[Math.floor(Math.random() * this.players.length)];
  }

  async getAllPlayers(): Promise<Character[]> {
    await this.loadPromise;
    return this.players;
  }
}
