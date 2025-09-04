import { Pipe, PipeTransform } from '@angular/core';
import { HDate, HebrewCalendar } from '@hebcal/core';
import { CalendarService } from '../services/calendar.service';
@Pipe({
  name: 'hebTimeName',
})
export class hebTimeNamePipe implements PipeTransform {
  constructor(public calendarService: CalendarService) {}

  transform(time: string, timeType: string) {
    if (time == null) return "";
    let year =
      timeType === 'year'
        ? parseInt(time)
        : parseInt(this.calendarService.chosenDateHeb().y);
    let month = timeType === 'month' ? parseInt(time) : 1;

    const hDate = new HDate(1, month, year);
    const hDateTranslatedArr = hDate.renderGematriya().split(' ');

    if (timeType === 'year') {
      if (
        hDate.isLeapYear() &&
        (hDate.getMonth() === 12 || hDate.getMonth() === 13)
      )
        return hDateTranslatedArr[3];
      return hDateTranslatedArr[2];
    } else {
      let result = hDateTranslatedArr[1];
      if (
        hDate.isLeapYear() &&
        (hDate.getMonth() === 12 || hDate.getMonth() === 13)
      )
        result += ' ' + hDateTranslatedArr[2];
      return result;
    }
  }
}
