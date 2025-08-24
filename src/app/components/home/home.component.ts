import { Component } from '@angular/core';
import { TimeNavigationComponent } from "./time-navigation/time-navigation.component";
import { CalendarComponent } from "./calendar/calendar.component";

@Component({
  selector: 'app-home',
  imports: [TimeNavigationComponent, CalendarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
