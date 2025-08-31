import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarDay } from '../../../models/day.model';
import { DAYS_IN_WEEK } from '../../../constants/dates.constants';
import { ShabbatFormatPipe } from '../../../pipes/shabbatFormat.pipe';
import { CalendarService } from '../../../services/calendar.service';
import { removeLeadingZeroesPipe } from '../../../pipes/removeLeadingZeroes.pipe';
import { ApplyEventColorDirective } from "../../../directives/applyEventColor.directive";

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, ShabbatFormatPipe, removeLeadingZeroesPipe, ApplyEventColorDirective],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  readonly daysInWeek = DAYS_IN_WEEK;

  constructor(public calendarService: CalendarService) {}

  ngOnInit(): void {
    this.calendarService.buildMonthToDisplay();
  }

  get daysToDisplay(): CalendarDay[] {
    return this.calendarService.daysToDisplaySignal();
  }

  get daysToDisplayRows(): CalendarDay[][] {
    const rows = [];
    for (let i = 0; i < this.daysToDisplay.length; i += 7) {
      rows.push(this.daysToDisplay.slice(i, i + 7));
    }
    return rows;
  }
}
