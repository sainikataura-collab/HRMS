import { Component } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-authentication-layout',
  standalone: true,
  imports: [SharedModule,RouterModule,RouterOutlet],
  templateUrl: './authentication-layout.component.html',
  styleUrl: './authentication-layout.component.scss'
})
export class AuthenticationLayoutComponent {

}
