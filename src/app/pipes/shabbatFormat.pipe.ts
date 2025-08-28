import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shabbatFormat',
})
export class ShabbatFormatPipe implements PipeTransform {
  transform(date: string) {
    if (!date) throw Error('Invalid pipe input');
    let shabbatFormat: string = '';

    if (date.includes('candles')) {
      shabbatFormat += 'כניסת שבת: ';
    } else if (date.includes('havdala')) {
      shabbatFormat += 'צאת השבת: ';
    } else {
      date.replace('פרשת', '');
    }
  }
}
