import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OccasionService } from '../../services/occasion.service';
import { AuthService } from '../../services/auth.service';
import { Occasion, WhenOption } from '../../models/occasion.model';

@Component({
  selector: 'app-finalize-occasion',
  templateUrl: './finalize-occasion.component.html',
  styleUrls: ['./finalize-occasion.component.scss'],
})
export class FinalizeOccasionComponent implements OnInit {
  occasion: Occasion | undefined;
  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: OccasionService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      finalDate: ['', Validators.required],
      finalLocation: ['', Validators.required],
      finalNotes: [''],
    });
  }

  ngOnInit(): void {
    const userEmail = this.auth.getCurrentUser()?.email ?? '';
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getOccasions().subscribe(occasions => {
      const found = occasions.find(o => o.id === id);
      if (!found || !this.svc.canAccess(found, userEmail)) {
        this.router.navigate(['/']);
        return;
      }
      this.occasion = found;
    });
  }

  topWhenOption(): string {
    if (!this.occasion?.whenOptions.length) return '';
    const top = [...this.occasion.whenOptions].sort((a, b) => b.votes.length - a.votes.length)[0];
    const date = new Date(top.date + 'T00:00:00');
    const datePart = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const fmt = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
    };
    return `${datePart} · ${fmt(top.startTime)} – ${fmt(top.endTime)}`;
  }

  topWhenLabel(opt: WhenOption): string {
    const date = new Date(opt.date + 'T00:00:00');
    const datePart = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const fmt = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
    };
    return `${datePart} · ${fmt(opt.startTime)} – ${fmt(opt.endTime)}`;
  }

  topWhereOption(): string {
    if (!this.occasion?.whereOptions.length) return '';
    return [...this.occasion.whereOptions].sort((a, b) => b.votes.length - a.votes.length)[0].label;
  }

  prefillTop(): void {
    this.form.patchValue({
      finalDate: this.topWhenOption(),
      finalLocation: this.topWhereOption(),
    });
  }

  submit(): void {
    if (this.form.invalid || !this.occasion) return;
    const { finalDate, finalLocation, finalNotes } = this.form.value;
    this.svc.finalize(this.occasion.id, finalDate, finalLocation, finalNotes);
    this.router.navigate(['/occasion', this.occasion.id]);
  }

  cancel(): void {
    this.router.navigate(['/occasion', this.occasion?.id]);
  }
}
