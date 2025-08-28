import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarDay } from '../../../models/day.model';
import { DAYS_IN_WEEK } from '../../../constants/dates.constants';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  readonly daysInWeek = DAYS_IN_WEEK;
  daysToDisplay: CalendarDay[] = [];

  constructor() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    console.log(currentYear);
    console.log(currentMonth);

    // this.fetchApiTimes(currentYear, currentMonth);
  }

  async fetchApiTimes(year, month) {
    const georgian = await fetch(
      `https://www.hebcal.com/hebcal?v=1&cfg=json&year=${year}&month=${month}&d=on&maj=on&min=on&mod=on&nx=on&ss=on&mf=on&s=on&leyning=off&i=on&c=on&M=on&geo=geoname&geonameid=293397`
    ).then((res) => res.json());

    if (georgian?.items != null) {
      georgian.items.forEach((item) => {
        // console.log(item);
        if (item.category === 'hebdate') {
          this.daysToDisplay.push({
            geoDate: item.date,
            heDate: item.hebrew,
            specialEvents: [],
          });
        }
        // else {
        //   this.daysToDisplay[this.daysToDisplay.length - 1].specialEvents.push(item.event)
        // }
      });
    }

    console.log(this.daysToDisplay);
  }
}
