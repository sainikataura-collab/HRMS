import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskManagerComponent } from '../../task-manager/task-manager.component';

@Component({
  selector: 'app-taskbox-dash',
  standalone: true,
  imports: [CommonModule, TaskManagerComponent],
  templateUrl: './taskbox-dash.component.html',
  styleUrl: './taskbox-dash.component.scss'
})
export class TaskboxDashComponent {}
