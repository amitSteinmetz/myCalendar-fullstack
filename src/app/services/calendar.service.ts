import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { CalendarDay, DayParts } from '../models/day.model';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  daysToDisplaySignal: WritableSignal<CalendarDay[]> = signal([]);
  isHebrewMode: boolean = false;
  chosenDateGeo: WritableSignal<DayParts> = signal(null);
  chosenDateHeb: WritableSignal<DayParts> = signal(null);
  // hebLinkedTimeOfDisplayedPeriod = computed(() => this.chosenDateGeo())

  constructor() {
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = (now.getMonth() + 1).toString();

    this.chosenDateGeo.set({
      y: currentYear,
      m: currentMonth,
      d: now.getDate.toString(),
    });

    this.setChosenDateHeb();
  }

  async setChosenDateHeb() {
    const currentDateHeb = await fetch(
      `https://www.hebcal.com/converter?cfg=json&gy=${this.chosenDateGeo().y}&gm=${this.chosenDateGeo().m}&gd=01&g2h=1&strict=1`
    ).then((res) => res.json());

    this.chosenDateHeb.set({
      y: currentDateHeb.heDateParts.y,
      m: currentDateHeb.heDateParts.m,
      d: currentDateHeb.heDateParts.d,
    });
  }

  async buildMonthToDisplay(year?, month?) {
    this.daysToDisplaySignal.set([]);
    let apiYearArg = year == null ? this.chosenDateGeo().y : year;
    let apiMonthArg = year == null ? this.chosenDateGeo().m : month;

    const apiDates = await this.fetchApiTimesByMonth(apiYearArg, apiMonthArg);
    let constructeddaysToDisplay =
      this.constructdaysToDisplayFromApiResponse(apiDates);
    this.daysToDisplaySignal.update((curr) => [
      ...constructeddaysToDisplay,
      ...curr,
    ]);

    const firstDate = this.findEdgeDateToDisplay(true);
    if (firstDate != null) {
      const apiFirstWeekDates = await this.fetchApiTimesByRange(
        firstDate,
        this.getComputedGeoDate(this.daysToDisplaySignal()[0], true)
      );
      constructeddaysToDisplay =
        this.constructdaysToDisplayFromApiResponse(apiFirstWeekDates);
      this.daysToDisplaySignal.update((curr) => [
        ...constructeddaysToDisplay,
        ...curr,
      ]);
    }

    const lastDate = this.findEdgeDateToDisplay(false);
    if (lastDate != null) {
      const apiLastWeekDates = await this.fetchApiTimesByRange(
        this.getComputedGeoDate(
          this.daysToDisplaySignal()[this.daysToDisplaySignal().length - 1],
          false
        ),
        lastDate
      );
      constructeddaysToDisplay =
        this.constructdaysToDisplayFromApiResponse(apiLastWeekDates);

      this.daysToDisplaySignal.update((curr) => [
        ...curr,
        ...constructeddaysToDisplay,
      ]);
    }
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
  constructdaysToDisplayFromApiResponse(apiDates) {
    const constructeddaysToDisplay: CalendarDay[] = [];

    if (apiDates?.items != null) {
      apiDates.items.forEach((item) => {
        this.constructDayToDisplayFromApiDayItem(
          item,
          constructeddaysToDisplay
        );
      });
      return constructeddaysToDisplay;
    }
    return null;
  }
  constructDayToDisplayFromApiDayItem(
    calendarDay,
    constructeddaysToDisplay: CalendarDay[]
  ) {
    let currDayIndex =
      constructeddaysToDisplay.length === 0
        ? 0
        : constructeddaysToDisplay.length - 1;
    const currDayToDisplay: CalendarDay =
      constructeddaysToDisplay[currDayIndex];

    switch (calendarDay.category) {
      case 'hebdate':
        const date = this.extractDateParts(calendarDay.date);
        const matchingDayInWeek = this.getMatchingDayInWeek(
          parseInt(date.y),
          parseInt(date.m) - 1,
          parseInt(date.d)
        );

        constructeddaysToDisplay.push({
          geoDate: this.extractDateParts(calendarDay.date),
          heDate: calendarDay.heDateParts,
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

    const y = dateSplitted[0];
    const m = dateSplitted[1];
    const d = dateSplitted[2];

    return { y, m, d };
  }
  formatDatePart(datePart: number) {
    return datePart < 10 ? '0' + datePart : datePart;
  }
  findEdgeDateToDisplay(isStartDate) {
    if (this.daysToDisplaySignal().length === 0)
      throw Error('No days to display');

    const edgeDay = isStartDate
      ? this.daysToDisplaySignal()[0]
      : this.daysToDisplaySignal()[this.daysToDisplaySignal().length - 1];

    if (
      (isStartDate && edgeDay.dayInWeek !== 0) ||
      (!isStartDate && edgeDay.dayInWeek !== 6)
    ) {
      const date = new Date(
        edgeDay.geoDate.y + '-' + edgeDay.geoDate.m + '-' + edgeDay.geoDate.d
      );
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
    const date = new Date(
      dayToDisplay.geoDate.y +
        '-' +
        dayToDisplay.geoDate.m +
        '-' +
        dayToDisplay.geoDate.d
    );
    let incNumber = isFirstDayInMonth ? -1 : 1;
    date.setDate(date.getDate() + incNumber);

    const year = date.getFullYear();
    const monthFormatted = this.formatDatePart(date.getMonth() + 1);
    const dayFormatted = this.formatDatePart(date.getDate());

    return year + '-' + monthFormatted + '-' + dayFormatted;
  }

  toggleHebrewMode(isHebrewMode: boolean) {
    this.isHebrewMode = isHebrewMode;
  }

  //** Getters & Setters **/
  get geoLinkedTimeOfDisplayedPeriod() {
    let result: any = {};

    result.nextYear = parseInt(this.chosenDateGeo().y) + 1;
    result.prevYear = parseInt(this.chosenDateGeo().y) - 1;
    result.nextMonth =
      parseInt(this.chosenDateGeo().m) === 11
        ? 0
        : parseInt(this.chosenDateGeo().m) + 1;
    result.prevMonth =
      parseInt(this.chosenDateGeo().m) === 0
        ? 11
        : parseInt(this.chosenDateGeo().m) - 1;

    return result;
  }

  setChosenDateGeo(year, month) {
    this.chosenDateGeo.update(prev => ({
      y: year,
      m: month,
      d: prev.d
    }));
    this.setChosenDateHeb();    
  }

  // get hebLinkedTimeOfDisplayedPeriod() {
  //   let result: any = {};

  //   const nextTimePeriod = await fetch(
  //     `https://www.hebcal.com/converter?cfg=json&gy=${this.geoLinkedTimeOfDisplayedPeriod.nextYear}&gm=${this.geoLinkedTimeOfDisplayedPeriod.nextMonth}&gd=1&g2h=1&strict=1`
  //   ).then((res) => res.json());

  //   const prevTimePeriod = await fetch(
  //     `https://www.hebcal.com/converter?cfg=json&gy=${this.geoLinkedTimeOfDisplayedPeriod.prevYear}&gm=${this.geoLinkedTimeOfDisplayedPeriod.prevMonth}&gd=1&g2h=1&strict=1`
  //   ).then((res) => res.json());

  //   result.nextYear = nextTimePeriod.heDayParts.y;
  //   result.nextMonth = nextTimePeriod.heDayParts.m;
  //   result.prevYear = prevTimePeriod.heDayParts.y;
  //   result.prevMonth = prevTimePeriod.heDayParts.m;

  //   return result;
  // }
}
