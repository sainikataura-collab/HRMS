import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskManagerComponent } from '../../../task-manager/task-manager.component';

@Component({
  selector: 'app-task-box-dash',
  standalone: true,
  imports: [CommonModule, TaskManagerComponent],
  templateUrl: './task-box-dash.component.html',
  styleUrl: './task-box-dash.component.scss'
})
export class TaskBoxDashComponent {

}
