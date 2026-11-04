import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-taskbox-dashboard',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './taskbox-dashboard.component.html',
  styleUrl: './taskbox-dashboard.component.scss'
})
export class TaskboxDashboardComponent {

}
