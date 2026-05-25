import { Injectable } from '@angular/core';

interface Character {
  name: string;
  emoji: string;
}

@Injectable({ providedIn: 'root' })
export class CharacterAvatarService {
  private characters: Character[] = [
    // The Simpsons
    { name: 'Homer', emoji: '🍩' },
    { name: 'Marge', emoji: '👩' },
    { name: 'Bart', emoji: '😈' },
    { name: 'Lisa', emoji: '🎺' },
    { name: 'Maggie', emoji: '👶' },
    // Bob's Burgers
    { name: 'Bob', emoji: '👨‍🍳' },
    { name: 'Linda', emoji: '💃' },
    { name: 'Tina', emoji: '📚' },
    { name: 'Gene', emoji: '🎹' },
    { name: 'Louise', emoji: '🐰' },
    // Family Guy
    { name: 'Peter', emoji: '🍺' },
    { name: 'Lois', emoji: '👸' },
    { name: 'Chris', emoji: '🐔' },
    { name: 'Stewie', emoji: '💣' },
    { name: 'Brian', emoji: '🐶' },
  ];

  getCharacter(userId: string): Character {
    const hash = this.hashCode(userId);
    const index = Math.abs(hash) % this.characters.length;
    return this.characters[index];
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }
}
