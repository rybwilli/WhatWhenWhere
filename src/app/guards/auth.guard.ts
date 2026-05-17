import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { getCurrentUser } from 'aws-amplify/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): Observable<boolean> {
    return from(getCurrentUser()).pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
