import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TimePickerComponent), multi: true }],
})
export class TimePickerComponent implements ControlValueAccessor {
  @Input() label = '';

  readonly hours = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  readonly minutes = ['00','05','10','15','20','25','30','35','40','45','50','55'];

  hour = '6';
  minute = '00';
  ampm = 'PM';
  disabled = false;

  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    if (!value) return;
    const [h, m] = value.split(':').map(Number);
    this.ampm = h >= 12 ? 'PM' : 'AM';
    this.hour = String(h % 12 || 12);
    const snapped = Math.round(m / 5) * 5;
    this.minute = (snapped >= 60 ? 0 : snapped).toString().padStart(2, '0');
  }

  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onHourChange(event: Event): void {
    this.hour = (event.target as HTMLSelectElement).value;
    this.emit();
  }
  onMinuteChange(event: Event): void {
    this.minute = (event.target as HTMLSelectElement).value;
    this.emit();
  }
  onAmpmChange(event: Event): void {
    this.ampm = (event.target as HTMLSelectElement).value;
    this.emit();
  }

  private emit(): void {
    let h = +this.hour % 12;
    if (this.ampm === 'PM') h += 12;
    this.onChange(`${h.toString().padStart(2, '0')}:${this.minute}`);
  }
}
