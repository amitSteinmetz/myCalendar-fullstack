import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-time-navigation',
  imports: [CommonModule],
  templateUrl: './time-navigation.component.html',
  styleUrl: './time-navigation.component.scss'
})
export class TimeNavigationComponent {
  isEnglishMode: boolean = true;
}
