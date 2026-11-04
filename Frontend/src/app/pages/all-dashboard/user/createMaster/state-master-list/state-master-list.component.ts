import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-state-master-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,],
  templateUrl: './state-master-list.component.html',
  styleUrl: './state-master-list.component.scss'
})
export class StateMasterListComponent {

}
