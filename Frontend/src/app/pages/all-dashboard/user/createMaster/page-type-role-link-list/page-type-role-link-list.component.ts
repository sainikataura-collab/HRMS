import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-type-role-link-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,],
  templateUrl: './page-type-role-link-list.component.html',
  styleUrl: './page-type-role-link-list.component.scss'
})
export class PageTypeRoleLinkListComponent {

}
