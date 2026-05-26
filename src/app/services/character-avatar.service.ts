import { Injectable } from '@angular/core';

interface Character {
  name: string;
  imagePath: string;
}

@Injectable({ providedIn: 'root' })
export class CharacterAvatarService {
  private characters: Character[] = [
    { name: 'Homer', imagePath: 'assets/Avatars/Homer.png' },
    { name: 'Marge', imagePath: 'assets/Avatars/Marge.png' },
    { name: 'Bart', imagePath: 'assets/Avatars/Bart.png' },
    { name: 'Lisa', imagePath: 'assets/Avatars/Lisa.png' },
    { name: 'Maggie', imagePath: 'assets/Avatars/Maggie.png' },
    { name: 'Chief Wiggum', imagePath: 'assets/Avatars/ChiefWiggum.png' },
    { name: 'Comic Book Guy', imagePath: 'assets/Avatars/ComicBookGuy.png' },
    { name: 'Grandma', imagePath: 'assets/Avatars/Grandma.png' },
    { name: 'Itchy', imagePath: 'assets/Avatars/Itchy.png' },
    { name: 'Rev. Lovejoy', imagePath: 'assets/Avatars/RevLovejoy.png' },
    { name: 'Smithers', imagePath: 'assets/Avatars/Smithers.png' },
  ];

  getRandomCharacter(): Character {
    const index = Math.floor(Math.random() * this.characters.length);
    return this.characters[index];
  }
}
