import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomNavigationModalComponent } from './custom-navigation-modal/custom-navigation-modal.component';
import { CalendarService } from '../../../services/calendar.service';
import { removeLeadingZeroesPipe } from '../../../pipes/removeLeadingZeroes.pipe';
import {
  MONTHS_GREGORIAN,
  MONTHS_HEBREW,
} from '../../../constants/dates.constants';
import { hebTimeNamePipe } from '../../../pipes/hebTimeName.pipe';

@Component({
  selector: 'app-time-navigation',
  imports: [
    CommonModule,
    CustomNavigationModalComponent,
    hebTimeNamePipe
  ],
  templateUrl: './time-navigation.component.html',
  styleUrl: './time-navigation.component.scss',
})
export class TimeNavigationComponent {
  showCustomNaigationModal: boolean = false;
  geoMonthsNames = MONTHS_GREGORIAN;
  hebMonthNames = MONTHS_HEBREW;

  constructor(public calendarService: CalendarService) {}

  toggleShowCustomNaigationModal() {
    this.showCustomNaigationModal = !this.showCustomNaigationModal;
  }

  onChangeTimePeriodToDisplayButtonClicked(year, month, isNext: boolean) {
    const isYearSameToChosenYear: boolean = this.isYearSameToChosenYear(year);

    let yearArg = parseInt(year);
    if (!this.calendarService.isHebrewMode) {
      if (month === 1 && isNext && isYearSameToChosenYear) (yearArg += 1) + '';
      else if (month === 12 && !isNext && isYearSameToChosenYear) (yearArg -= 1) + '';
    } else {
      if (month === 7 && isNext && isYearSameToChosenYear) (yearArg += 1) + '';
      else if (month === 6 && !isNext && isYearSameToChosenYear) (yearArg -= 1) + '';
    }
    console.log('year to move to: ', yearArg);
    console.log('month to move to: ', month);
    this.calendarService.setChosenDateGeo(yearArg, month);
  }

  isYearSameToChosenYear(year) {
    if (!this.calendarService.isHebrewMode) {
      return this.calendarService.chosenDateGeo().y === year;
    } else return this.calendarService.chosenDateHeb().y === year;
  }

  getIndexOfCurrHebMonth() {
    return this.hebMonthNames.indexOf(this.calendarService.chosenDateHeb()?.m);
  }

  getTimeAsInt(time: string) {
    return parseInt(time);
  }
}
