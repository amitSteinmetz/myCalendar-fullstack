import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shabbatFormat',
})
export class ShabbatFormatPipe implements PipeTransform {
  transform(date: string) {
    if (!date) throw Error('Invalid pipe input');
    let shabbatFormat: string = '';
    console.log(date);
    if (date.includes('Candle')) {
      shabbatFormat += 'כניסת שבת: ' + date.slice(-5);
    } else if (date.includes('Havdalah')) {
      shabbatFormat += 'צאת השבת: ' + date.slice(-5);
    } else {
      shabbatFormat = date.slice(5);
    }
    return shabbatFormat;
  }
}
