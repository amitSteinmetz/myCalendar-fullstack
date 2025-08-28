import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dayPart'
})
export class DayPartPipe implements PipeTransform {
  transform(date: string): string {
    if (!date) return '';
    const parts = date.split('-');
    if (parts.length !== 3) throw Error("Invalid pipe input")
    let dayPart = parts[2];
    return (dayPart[0] === '0') ? dayPart.slice(1) : dayPart;
  }
}