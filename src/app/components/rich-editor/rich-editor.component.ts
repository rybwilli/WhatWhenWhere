import { Component, forwardRef, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rich-editor',
  templateUrl: './rich-editor.component.html',
  styleUrls: ['./rich-editor.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RichEditorComponent),
    multi: true,
  }],
})
export class RichEditorComponent implements ControlValueAccessor, AfterViewInit {
  @Input() placeholder = 'Enter text...';
  @Input() minHeight = '120px';
  @ViewChild('editor') editorEl!: ElementRef<HTMLDivElement>;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};
  private pendingValue = '';

  ngAfterViewInit(): void {
    if (this.pendingValue) {
      this.editorEl.nativeElement.innerHTML = this.pendingValue;
    }
  }

  writeValue(value: string): void {
    const html = value ?? '';
    if (this.editorEl) {
      this.editorEl.nativeElement.innerHTML = html;
    } else {
      this.pendingValue = html;
    }
  }

  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  onInput(): void {
    this.onChange(this.editorEl.nativeElement.innerHTML);
  }

  onBlur(): void { this.onTouched(); }

  exec(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.editorEl.nativeElement.focus();
    this.onChange(this.editorEl.nativeElement.innerHTML);
  }

  insertLink(): void {
    const url = prompt('Enter URL:');
    if (url) this.exec('createLink', url);
  }

  isActive(command: string): boolean {
    try { return document.queryCommandState(command); } catch { return false; }
  }
}
