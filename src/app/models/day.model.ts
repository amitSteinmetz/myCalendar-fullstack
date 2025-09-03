import { Shabbat } from './shabbat.model';

export interface CalendarDay {
  dayInWeek: number;
  heDate: DateParts;
  geoDate: DateParts;
  shabbatEvents?: Shabbat;
  specialEvents?: string[];
}

export interface DateParts {
  m: string;
  y: string;
  d: string;
}
