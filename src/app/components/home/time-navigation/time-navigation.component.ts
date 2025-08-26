import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomNavigationModalComponent } from './custom-navigation-modal/custom-navigation-modal.component';

@Component({
  selector: 'app-time-navigation',
  imports: [CommonModule, CustomNavigationModalComponent],
  templateUrl: './time-navigation.component.html',
  styleUrl: './time-navigation.component.scss',
})
export class TimeNavigationComponent {
  isEnglishMode: boolean = true;
  showCustomNaigationModal: boolean = false;

  toggleShowCustomNaigationModal() {
    this.showCustomNaigationModal = !this.showCustomNaigationModal;
  }
}
