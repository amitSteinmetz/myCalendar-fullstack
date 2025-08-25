import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
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

  constructor(private _router: Router) {
    console.log(this.router.url);
  }

  onShowMobileMenuListButtonClicked() {
    this.showMobileMenuList = !this.showMobileMenuList;
  }

  onLinkClicked(linkIndex: number) {
    if (linkIndex === 0) {
      this.router.navigate(["/"])
    }
  }

  get router() {
    return this._router;
  }
}
