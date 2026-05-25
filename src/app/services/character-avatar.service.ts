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

  getRandomCharacter(): Character {
    const index = Math.floor(Math.random() * this.characters.length);
    return this.characters[index];
  }
}
