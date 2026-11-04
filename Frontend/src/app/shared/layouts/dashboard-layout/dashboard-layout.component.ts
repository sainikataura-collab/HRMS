import { Component, inject } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { RouterOutlet } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { UiStateService } from '../../services/ui-state.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [SharedModule,RouterOutlet,CommonModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
  
  uiStateService= inject(UiStateService);
  cameraMode = false;

  ngOnInit() {
       this.ngxUILoaderService.stop();
      this.uiStateService.cameraMode$.subscribe((mode) => {
        this.cameraMode = mode;
  });
 

  }
}

