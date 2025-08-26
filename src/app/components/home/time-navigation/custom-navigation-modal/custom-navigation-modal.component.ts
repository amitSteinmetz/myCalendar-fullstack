import { Component, EventEmitter, Output } from '@angular/core';

@Component({
selector: 'app-custom-navigation-modal',
  imports: [],
  templateUrl: './custom-navigation-modal.component.html',
  styleUrl: './custom-navigation-modal.component.scss',
})
export class CustomNavigationModalComponent {
  @Output() close_modal: EventEmitter<void> = new EventEmitter();

  onCloseModalButtonClicked() {
    this.close_modal.emit();
  }
}
