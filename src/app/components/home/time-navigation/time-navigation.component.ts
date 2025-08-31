import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomNavigationModalComponent } from './custom-navigation-modal/custom-navigation-modal.component';
import { CalendarService } from '../../../services/calendar.service';
import { removeLeadingZeroesPipe } from '../../../pipes/removeLeadingZeroes.pipe';

@Component({
  selector: 'app-time-navigation',
  imports: [
    CommonModule,
    CustomNavigationModalComponent,
    removeLeadingZeroesPipe,
  ],
  templateUrl: './time-navigation.component.html',
  styleUrl: './time-navigation.component.scss',
})
export class TimeNavigationComponent {
  showCustomNaigationModal: boolean = false;

  constructor(public calendarService: CalendarService) {}

  toggleShowCustomNaigationModal() {
    this.showCustomNaigationModal = !this.showCustomNaigationModal;
  }

  onChangeTimePeriodToDisplayButtonClicked(year, month) {
    this.calendarService.setChosenDateGeo(year, month);
    this.calendarService.buildMonthToDisplay(year, month);
  }
}
