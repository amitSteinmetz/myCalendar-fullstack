import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appApplyEventColor]',
})
export class ApplyEventColorDirective {
  constructor(private el: ElementRef) {}

  @Input('appApplyEventColor') eventText: string = '';

  private eventTypes = [
    { substring: 'ראש חודש', color: '#7bbf6a' },
    { substring: 'שבת', color: '#0072c6' }, 
    { substring: 'צום', color: '#e04006' }, 
    { substring: '', color: '#ff1a1a'} // default
  ];

  ngOnInit() {
    const match = this.eventTypes.find((type) =>
      this.eventText.includes(type.substring)
    );
    if (match) {
      this.el.nativeElement.style.color = match.color;
    }
  }
}
