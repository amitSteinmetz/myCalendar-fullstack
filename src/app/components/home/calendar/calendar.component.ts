import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarDay } from '../../../models/day.model';
import { DAYS_IN_WEEK } from '../../../constants/dates.constants';
import { DayPartPipe } from '../../../pipes/dayPart.pipe';
import { ShabbatFormatPipe } from '../../../pipes/shabbatFormat.pipe';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, DayPartPipe, ShabbatFormatPipe],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  readonly daysInWeek = DAYS_IN_WEEK;
  daysToDisplay: CalendarDay[] = [];

  //** Init functions **/
  ngOnInit(): void {
    this.buildInitialMonthToDisplay();
  }
  async buildInitialMonthToDisplay() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const apiDates = await this.fetchApiTimesByMonth(currentYear, currentMonth);
    let constructedDaysToDisplay =
      this.constructDaysToDisplayFromApiResponse(apiDates);
    this.daysToDisplay.splice(0, 0, ...constructedDaysToDisplay);

    const firstDate = this.findEdgeDateToDisplay(true);
    if (firstDate != null) {
      const apiFirstWeekDates = await this.fetchApiTimesByRange(
        firstDate,
        this.getComputedGeoDate(this.daysToDisplay[0], true)
      );
      constructedDaysToDisplay =
        this.constructDaysToDisplayFromApiResponse(apiFirstWeekDates);
      this.daysToDisplay.splice(0, 0, ...constructedDaysToDisplay);
    }

    const lastDate = this.findEdgeDateToDisplay(false);
    if (lastDate != null) {
      const apiLastWeekDates = await this.fetchApiTimesByRange(
        this.getComputedGeoDate(
          this.daysToDisplay[this.daysToDisplay.length - 1],
          false
        ),
        lastDate
      );
      constructedDaysToDisplay =
        this.constructDaysToDisplayFromApiResponse(apiLastWeekDates);
      this.daysToDisplay.splice(
        this.daysToDisplay.length,
        0,
        ...constructedDaysToDisplay
      );
    }

    console.log(this.daysToDisplay);
  }

  //** Fetch from API functions **//
  async fetchApiTimesByMonth(year, month) {
    return await fetch(
      `https://www.hebcal.com/hebcal?v=1&cfg=json&year=${year}&month=${month}&d=on&maj=on&min=on&mod=on&nx=on&ss=on&mf=on&s=on&leyning=off&i=on&c=on&M=on&geo=geoname&geonameid=293397`
    ).then((res) => res.json());
  }
  async fetchApiTimesByRange(startDate: string, endDate: string) {
    return await fetch(
      `https://www.hebcal.com/hebcal?v=1&cfg=json&start=${startDate}&end=${endDate}&d=on&maj=on&min=on&mod=on&nx=on&ss=on&mf=on&s=on&leyning=off&i=on&c=on&M=on&geo=geoname&geonameid=293397`
    ).then((res) => res.json());
  }

  //** Construct days to display from API response **//
  constructDaysToDisplayFromApiResponse(apiDates) {
    const constructedDaysToDisplay: CalendarDay[] = [];

    if (apiDates?.items != null) {
      apiDates.items.forEach((item) => {
        this.constructDayToDisplayFromApiDayItem(
          item,
          constructedDaysToDisplay
        );
      });
      return constructedDaysToDisplay;
    }
    return null;
  }
  constructDayToDisplayFromApiDayItem(calendarDay, constructedDaysToDisplay) {
    let currDayIndex =
      constructedDaysToDisplay.length === 0
        ? 0
        : constructedDaysToDisplay.length - 1;
    const currDayToDisplay: CalendarDay =
      constructedDaysToDisplay[currDayIndex];

    switch (calendarDay.category) {
      case 'hebdate':
        const date = this.extractDateParts(calendarDay.date);
        const matchingDayInWeek = this.getMatchingDayInWeek(
          date.year,
          date.month - 1,
          date.day
        );

        constructedDaysToDisplay.push({
          geoDate: calendarDay.date,
          heDate: calendarDay.hebrew,
          dayInWeek: matchingDayInWeek,
          specialEvents: [],
          shabbatEvents: {},
        });
        break;
      case 'holiday':
      case 'roshchodesh':
        currDayToDisplay.specialEvents.push(calendarDay.hebrew);
        break;
      case 'candles':
        currDayToDisplay.shabbatEvents.candlesTime = calendarDay.title;
        break;
      case 'havdalah':
        currDayToDisplay.shabbatEvents.havdalaTime = calendarDay.title;
        break;
      case 'parashat':
        currDayToDisplay.shabbatEvents.parasha = calendarDay.hebrew;
        break;
    }
  }

  //** Utillities **/
  getMatchingDayInWeek(year: number, month: number, day: number) {
    const date = new Date(year, month, day);
    const dayInWeek = date.getDay();
    return dayInWeek;
  }
  extractDateParts(date: string) {
    let dateSplitted = date.split('-');

    if (dateSplitted.length !== 3) throw Error;

    const year = parseInt(dateSplitted[0]);
    const month = parseInt(dateSplitted[1]);
    const day = parseInt(dateSplitted[2]);

    return { year, month, day };
  }
  formatDatePart(datePart: number) {
    return datePart < 10 ? '0' + datePart : datePart;
  }
  findEdgeDateToDisplay(isStartDate) {
    if (this.daysToDisplay.length === 0) throw Error('No days to display');

    const edgeDay = isStartDate
      ? this.daysToDisplay[0]
      : this.daysToDisplay[this.daysToDisplay.length - 1];

    if (
      (isStartDate && edgeDay.dayInWeek !== 0) ||
      (!isStartDate && edgeDay.dayInWeek !== 6)
    ) {
      const date = new Date(edgeDay.geoDate);
      const edgeDateIndex =
        date.getDate() -
        (isStartDate ? edgeDay.dayInWeek : edgeDay.dayInWeek - 6);
      date.setDate(edgeDateIndex);

      const year = date.getFullYear();
      const monthFormatted = this.formatDatePart(date.getMonth() + 1);
      const dayFormatted = this.formatDatePart(date.getDate());

      return year + '-' + monthFormatted + '-' + dayFormatted;
    }

    return null;
  }
  getComputedGeoDate(dayToDisplay: CalendarDay, isFirstDayInMonth) {
    const date = new Date(dayToDisplay.geoDate);
    let incNumber = isFirstDayInMonth ? -1 : 1;
    date.setDate(date.getDate() + incNumber);

    const year = date.getFullYear();
    const monthFormatted = this.formatDatePart(date.getMonth() + 1);
    const dayFormatted = this.formatDatePart(date.getDate());

    return year + '-' + monthFormatted + '-' + dayFormatted;
  }

  get daysToDisplayRows(): CalendarDay[][] {
    const rows = [];
    for (let i = 0; i < this.daysToDisplay.length; i += 7) {
      rows.push(this.daysToDisplay.slice(i, i + 7));
    }
    return rows;
  }
}
