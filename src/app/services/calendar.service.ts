import {
  computed,
  effect,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { CalendarDay, DateParts } from '../models/day.model';
import {
  HebrewCalendar,
  HDate,
  Location,
  Event,
  CalOptions,
} from '@hebcal/core';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  daysToDisplaySignal: WritableSignal<CalendarDay[]> = signal([]);
  isHebrewMode: boolean = false;
  chosenDateGeo: WritableSignal<DateParts> = signal(null);
  chosenDateHeb: WritableSignal<DateParts> = signal(null);

  constructor() {
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = (now.getMonth() + 1).toString();

    // Init current georgian and hebrew month and year according to current time //
    this.chosenDateGeo.set({
      y: currentYear,
      m: currentMonth,
      d: '01',
    });

    const currHebDate = new HDate();
    this.chosenDateHeb.set({
      y: currHebDate.yy.toString(),
      m: currHebDate.mm.toString(),
      d: '01',
    });
    console.log('Initial geo month: ', this.chosenDateGeo().m);
    effect(() => {
      console.log('Step 2 - effect is running...');
      this.buildMonthToDisplay();
    });
  }

  async buildMonthToDisplay() {
    this.daysToDisplaySignal.set([]);
    let apiDates;

    if (this.isHebrewMode) {
      // findEdges
      const { startEdge, endEdge } = this.findEdgeHebrewMonthDays();
      console.log(
        'Step 2 in Hebrew mode, edges to display: \nstartEdgeInGeoFormat: ',
        startEdge,
        '\nendEdgeInGeoFormat: ',
        endEdge
      );
      let startEdgeFormatted =
        startEdge.y +
        '-' +
        this.formatDatePart(parseInt(startEdge.m)) +
        '-' +
        this.formatDatePart(parseInt(startEdge.d));
      let endEdgeFormatted =
        endEdge.y +
        '-' +
        this.formatDatePart(parseInt(endEdge.m)) +
        '-' +
        this.formatDatePart(parseInt(endEdge.d));

      // Fetch by edges
      apiDates = await this.fetchApiTimesByRange(
        startEdgeFormatted,
        endEdgeFormatted
      );
      console.log('Step 3 in hebrew mode - the dates to display: \n', apiDates);
    } else {
      apiDates = await this.fetchApiTimesByMonth();
      console.log(
        'Step 3 in georgian mode - the dates to display: \n',
        apiDates
      );
    }

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
  async fetchApiTimesByMonth() {
    console.log(
      'Fetch with time: \nyear: ',
      this.chosenDateGeo().y,
      '\nmonth: ',
      this.chosenDateGeo().m
    );
    return await fetch(
      `https://www.hebcal.com/hebcal?v=1&cfg=json&year=${
        this.chosenDateGeo().y
      }&month=${
        this.chosenDateGeo().m
      }&d=on&maj=on&min=on&mod=on&nx=on&ss=on&mf=on&s=on&leyning=off&i=on&c=on&M=on&geo=geoname&geonameid=293397`
    ).then((res) => res.json());
  }
  async fetchApiTimesByRange(startDate: string, endDate: string) {
    return await fetch(
      `https://www.hebcal.com/hebcal?v=1&cfg=json&start=${startDate}&end=${endDate}&d=on&maj=on&min=on&mod=on&nx=on&ss=on&mf=on&s=on&leyning=off&i=on&c=on&M=on&geo=geoname&geonameid=293397`
    ).then((res) => res.json());
  }

  findEdgeHebrewMonthDays() {
    const startEdgeHeDate = new HDate(
      1,
      this.chosenDateHeb().m,
      parseInt(this.chosenDateHeb().y)
    );
    const endEdgeHeDate = startEdgeHeDate.add(
      startEdgeHeDate.daysInMonth() - 1,
      'd'
    );
    let destructedStartEdgeHeDate: DateParts = {
      y: startEdgeHeDate.greg().getFullYear() + '',
      m: startEdgeHeDate.greg().getMonth() + 1 + '',
      d: startEdgeHeDate.greg().getDate() + '',
    };
    let destructedEndEdgeHeDate: DateParts = {
      y: endEdgeHeDate.greg().getFullYear() + '',
      m: endEdgeHeDate.greg().getMonth() + 1 + '',
      d: endEdgeHeDate.greg().getDate() + '',
    };

    return {
      startEdge: destructedStartEdgeHeDate,
      endEdge: destructedEndEdgeHeDate,
    };
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
    this.buildMonthToDisplay();
  }

  //** Getters & Setters **/
  get geoLinkedTimeOfDisplayedPeriod() {
    let result: any = {};

    result.nextYear = parseInt(this.chosenDateGeo().y) + 1;
    result.prevYear = parseInt(this.chosenDateGeo().y) - 1;
    result.nextMonth =
      parseInt(this.chosenDateGeo().m) === 12
        ? 1
        : parseInt(this.chosenDateGeo().m) + 1;
    result.prevMonth =
      parseInt(this.chosenDateGeo().m) === 1
        ? 12
        : parseInt(this.chosenDateGeo().m) - 1;

    return result;
  }

  get hebLinkedTimeOfDisplayedPeriod() {
    let result: any = {};
    const hDate = new HDate(
      10,
      parseInt(this.chosenDateHeb().m),
      parseInt(this.chosenDateHeb().y)
    );

    result.prevYear = parseInt(this.chosenDateHeb().y) - 1;
    result.nextYear = parseInt(this.chosenDateHeb().y) + 1;
    result.prevMonth = hDate.subtract(1, 'M').getMonth();
    result.nextMonth = hDate.add(1, 'M').getMonth();

    return result;
  }

  getEdgePeriodsOnCalendar(isMonth: boolean) {
    let startTime;
    let endTime;

    if (this.isHebrewMode) {
      startTime = isMonth
        ? this.daysToDisplaySignal()[0]?.heDate.m
        : this.daysToDisplaySignal()[0]?.heDate.y;
      endTime = isMonth
        ? this.daysToDisplaySignal()[-1]?.heDate.m
        : this.daysToDisplaySignal()[-1]?.heDate.y;
    } else {
      startTime = isMonth
        ? this.daysToDisplaySignal()[0]?.geoDate.m
        : this.daysToDisplaySignal()[0]?.geoDate.y;
      endTime = isMonth
        ? this.daysToDisplaySignal()[-1]?.geoDate.m
        : this.daysToDisplaySignal()[-1]?.geoDate.y;
    }
    console.log({ startTime, endTime });
    return { startTime, endTime };
  }

  setChosenDateGeo(year, month) {
    if (!this.isHebrewMode) {
      this.chosenDateGeo.set({
        y: year,
        m: month,
        d: '01',
      });

      const hDate = new HDate(
        new Date(
          parseInt(this.chosenDateGeo().y),
          parseInt(this.chosenDateGeo().m) - 1,
          1
        )
      );
      this.chosenDateHeb.set({
        y: hDate.yy.toString(),
        m: hDate.mm.toString(),
        d: '01',
      });

      console.log(
        'Step 1 in georgian mode - set chosenDateGeo:\n',
        this.chosenDateGeo()
      );
    } else {
      console.log(parseInt(year), parseInt(month));
      const hDate = new HDate(1, parseInt(month), parseInt(year));
      console.log('hdate: ', hDate);
      this.chosenDateHeb.set({
        y: hDate.yy.toString(),
        m: hDate.mm.toString(),
        d: '01',
      });

      this.chosenDateGeo.set({
        y: hDate.greg().getFullYear().toString(),
        m: hDate.greg().getMonth() + 1 + '',
        d: '01',
      });
      console.log(
        'Step 1 in hebrew mode - set chosenDateHeb:\n',
        this.chosenDateHeb()
      );
      console.log(
        'Step 1.b - prev and next months of chosenDateHeb:\n',
        this.hebLinkedTimeOfDisplayedPeriod
      );
    }
  }

  // async setChosenDateHeb() {
  //   const currentDateHeb = await fetch(
  //     `https://www.hebcal.com/converter?cfg=json&gy=${
  //       this.chosenDateGeo().y
  //     }&gm=${this.chosenDateGeo().m}&gd=01&g2h=1&strict=1`
  //   ).then((res) => res.json());
  //   console.log('currentDateHeb: ', currentDateHeb);

  //   this.chosenDateHeb.set({
  //     y: currentDateHeb.hy,
  //     m: currentDateHeb.heDateParts.m,
  //   });
  // }

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

  //    async fetchHebLinkedTimeOfDisplayedPeriod() {
  //     console.log('effect callback is running');
  //     let result: any = {};

  //     // find whole georgian time corresponding to the first day of current heberw month and year - api call for converter
  //     const geoDayMatchingToFirstDayOfHebMonth = await fetch(
  //       `https://www.hebcal.com/converter?cfg=json&hy=${
  //         this.chosenDateHeb().y
  //       }&hm=${this.chosenDateHeb().m}&hd=01&h2g=1&strict=1`
  //     ).then((res) => res.json());
  //     console.log(geoDayMatchingToFirstDayOfHebMonth);

  //     // Find the prev georgian day of geoDayMatchingToFirstDayOfHebMonth - using DateTime library functions
  //     const date = new Date(
  //       geoDayMatchingToFirstDayOfHebMonth.gy,
  //       geoDayMatchingToFirstDayOfHebMonth.gm - 1,
  //       geoDayMatchingToFirstDayOfHebMonth.gd - 1
  //     );
  //     console.log(date);

  //     // Find corresponding hebrew time of prev georgian date - api call for converter
  //     const prevMonth = await fetch(
  //       `https://www.hebcal.com/converter?cfg=json&gy=${date.getFullYear()}&gm=${
  //         date.getMonth() + 1
  //       }&gd=${date.getDate()}&g2h=1&strict=1`
  //     ).then((res) => res.json());
  //     console.log(prevMonth);

  //     //// Similar proccess with last day of current hebrew month: ////

  //     // Find the last day of heb month

  //     // find whole georgian time corresponding to the last day of current heberw month and year - api call for converter
  //     // const geoDayMatchingToLastDayOfHebMonth = await fetch(
  //     //   `https://www.hebcal.com/converter?cfg=json&hy=${
  //     //     this.chosenDateHeb().y
  //     //   }&hm=${this.chosenDateHeb().m}&hd=-1&h2g=1&strict=1`
  //     // ).then((res) => res.json());
  //     // console.log(geoDayMatchingToLastDayOfHebMonth);

  //     // Find the prev georgian day of geoDayMatchingToFirstDayOfHebMonth - using DateTime library functions
  //     // const date = new Date(
  //     //   geoDayMatchingToFirstDayOfHebMonth.gy,
  //     //   geoDayMatchingToFirstDayOfHebMonth.gm - 1,
  //     //   geoDayMatchingToFirstDayOfHebMonth.gd - 1
  //     // );
  //     // console.log(date);

  //     // Find corresponding hebrew time of prev georgian date - api call for converter
  //     // const prevMonth = await fetch(
  //     //   `https://www.hebcal.com/converter?cfg=json&gy=${
  //     //     date.getFullYear()
  //     //   }&gm=${date.getMonth() + 1}&gd=${date.getDate()}&g2h=1&strict=1`
  //     // ).then((res) => res.json());
  //     // console.log(prevMonth)

  //     // const nextTimePeriod = await fetch(
  //     //   `https://www.hebcal.com/converter?cfg=json&gy=${this.geoLinkedTimeOfDisplayedPeriod.nextYear}&gm=${this.geoLinkedTimeOfDisplayedPeriod.nextMonth}&gd=01&g2h=1&strict=1`
  //     // ).then((res) => res.json());

  //     // const prevTimePeriod = await fetch(
  //     //   `https://www.hebcal.com/converter?cfg=json&gy=${this.geoLinkedTimeOfDisplayedPeriod.prevYear}&gm=${this.geoLinkedTimeOfDisplayedPeriod.prevMonth}&gd=01&g2h=1&strict=1`
  //     // ).then((res) => res.json());

  //     // result.nextYear = nextTimePeriod.heDateParts.y;
  //     // result.nextMonth = nextTimePeriod.heDateParts.m;
  //     // result.prevYear = prevTimePeriod.heDateParts.y;
  //     // result.prevMonth = prevTimePeriod.heDateParts.m;

  //     // this.hebLinkedTimeOfDisplayedPeriod.set(result);
  //   }
}
