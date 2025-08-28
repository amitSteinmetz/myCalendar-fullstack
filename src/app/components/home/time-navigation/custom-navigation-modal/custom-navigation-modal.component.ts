import { Component, EventEmitter, Output } from '@angular/core';
import {
  MONTHS_HEBREW,
  MONTHS_GREGORIAN,
  HOLIDAYS,
} from '../../../../constants/dates.constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-navigation-modal',
  imports: [CommonModule],
  templateUrl: './custom-navigation-modal.component.html',
  styleUrl: './custom-navigation-modal.component.scss',
})
export class CustomNavigationModalComponent {
  monthsHebrew = MONTHS_HEBREW;
  monthsGregorian = MONTHS_GREGORIAN;
  holidays = HOLIDAYS;
  @Output() close_modal: EventEmitter<void> = new EventEmitter();

  onCloseModalButtonClicked() {
    this.close_modal.emit();
  }
}
