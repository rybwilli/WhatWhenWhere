import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OccasionService } from '../../services/occasion.service';
import { AuthService } from '../../services/auth.service';
import { Occasion } from '../../models/occasion.model';

@Component({
  selector: 'app-occasion-list',
  templateUrl: './occasion-list.component.html',
  styleUrls: ['./occasion-list.component.scss'],
})
export class OccasionListComponent implements OnInit {
  occasions: Occasion[] = [];
  private userEmail = '';

  constructor(
    private svc: OccasionService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userEmail = this.auth.getCurrentUser()?.email ?? '';
    this.svc.getAccessibleOccasions(this.userEmail).subscribe(o => (this.occasions = o));
  }

  open(id: string): void {
    this.router.navigate(['/occasion', id]);
  }

  create(): void {
    this.router.navigate(['/occasion/new']);
  }

  isOwner(o: Occasion): boolean {
    return o.ownerEmail?.toLowerCase() === this.userEmail.toLowerCase();
  }

  deleteOccasion(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Delete this occasion?')) {
      this.svc.delete(id);
    }
  }

  statusColor(status: string): string {
    return status === 'finalized' ? 'accent' : status === 'polling' ? 'primary' : 'warn';
  }
}
