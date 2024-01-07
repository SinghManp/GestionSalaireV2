import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCursorAtEnd]',
})
export class CursorAtEndDirective {
  constructor(private el: ElementRef) {}

  @HostListener('mousedown', ['$event'])
  handleClick(event: Event) { 
    const input = this.el.nativeElement;
    const len = input.value.length;
    if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(len, len);
    } else if ((<any>input).createTextRange) {
      const textRange = (<any>input).createTextRange();
      textRange.collapse(false);
      textRange.select();
    }
  }
}
