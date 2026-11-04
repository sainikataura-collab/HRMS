import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ChatbotComponent } from '../../components/onboarding-chatbot/chatbot.component';
import { OnBoardingSidebarComponent } from '../../components/on-boarding-sidebar/on-boarding-sidebar.component';

import { OnBoardingFooterComponent } from '../../components/on-boarding-footer/on-boarding-footer.component';
import { OnBoardingHeaderComponent } from '../../components/on-boarding-header/on-boarding-header.component';



@Component({
  selector: 'app-on-boarding-layout',
  standalone: true,
  imports: [RouterOutlet,OnBoardingSidebarComponent,OnBoardingHeaderComponent,ChatbotComponent],
  templateUrl: './on-boarding-layout.component.html',
  styleUrl: './on-boarding-layout.component.scss'
})
export class OnBoardingLayoutComponent {

}
