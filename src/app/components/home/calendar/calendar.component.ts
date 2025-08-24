import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Day } from '../../../models/day.model';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  readonly DAYS: string[] = [
    'שבת',
    'שישי',
    'חמישי',
    'רביעי',
    'שלישי',
    'שני',
    'ראשון',
  ];

  daysToDisplay: Day[][] = [
    [
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
    ],
    [
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
    ],
    [
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
    ],
    [
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
    ],
    [
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
      { date: 1 },
    ],
  ];
}
