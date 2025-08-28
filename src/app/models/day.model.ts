import { Shabbat } from './shabbat.model';

export interface CalendarDay {
  dayInWeek: number;
  heDate: DayParts;
  geoDate: DayParts;
  shabbatEvents?: Shabbat;
  specialEvents?: string[];
}

export interface DayParts {
  d: string;
  m: string;
  y: string;
}
