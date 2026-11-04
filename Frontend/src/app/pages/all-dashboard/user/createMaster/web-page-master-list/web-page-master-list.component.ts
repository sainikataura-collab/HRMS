import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-web-page-master-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './web-page-master-list.component.html',
  styleUrl: './web-page-master-list.component.scss'
})
export class WebPageMasterListComponent {

}
