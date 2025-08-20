import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly links = [
    'אודות',
    'תנאי שימוש',
    'מדיניות פרטיות',
    'יצירת קשר',
    'הצהרת נגישות',
    'אחד ועוד אחד',
  ];
}
