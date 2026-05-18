import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OccasionService } from '../../services/occasion.service';
import { AuthService } from '../../services/auth.service';
import { OCCASION_TYPES } from '../../models/occasion.model';

@Component({
  selector: 'app-create-occasion',
  templateUrl: './create-occasion.component.html',
  styleUrls: ['./create-occasion.component.scss'],
})
export class CreateOccasionComponent {
  form: FormGroup;
  saving = false;
  readonly occasionTypes = OCCASION_TYPES;

  constructor(
    private fb: FormBuilder,
    private svc: OccasionService,
    private router: Router,
    private auth: AuthService
  ) {
    const u = this.auth.getCurrentUser();
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      ownerName: [u?.displayName || u?.email || '', Validators.required],
      occasionType: [''],
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving = true;
    const { title, description, ownerName, occasionType } = this.form.value;
    const u = this.auth.getCurrentUser();
    try {
      const occasion = await this.svc.create(
        title, description, ownerName, u?.email ?? '', u?.userId ?? '', occasionType || undefined
      );
      this.router.navigate(['/occasion', occasion.id]);
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
