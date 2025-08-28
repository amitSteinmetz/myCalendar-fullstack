import { Shabbat } from "./shabbat.model";

export interface CalendarDay {
  dayInWeek: number;
  heDate: string;
  geoDate: string;
  shabbatEvents?: Shabbat;
  specialEvents?: string[];
}

