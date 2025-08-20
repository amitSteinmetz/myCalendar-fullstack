import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly mainLinks = [
    'לוח שנה עברי לועזי',
    'לוח שנה שנתי',
    'לוח חגים ומועדים',
    'זמני היום והשבת',
    'כניסת שבת וחג',
    'מלונות בוקינג',
  ];

  readonly additionalLinks = [
    'זמני היום לשנה',
    'זמני זריחה ושקיעה',
    'אודות לוח השנה',
    'יצירת קשר',
  ];

  showMobileMenuList: boolean = false;

  onShowMobileMenuListButtonClicked() {
    this.showMobileMenuList = !this.showMobileMenuList;
  }
}
