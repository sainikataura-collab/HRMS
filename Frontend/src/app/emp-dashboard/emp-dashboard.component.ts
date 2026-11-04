import { RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Component, inject} from '@angular/core';
import { CompensationService } from '../pages/all-employee/Compensation/Service/compensation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-emp-dashboard',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './emp-dashboard.component.html',
  styleUrl: './emp-dashboard.component.scss'
})
export class EmpDashboardComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
  activeModules: string[] = [];

  constructor(private moduleService: CompensationService) {}

  ngOnInit() {

    
     this.loadActiveModules();
}

  loadActiveModules(): void {
    this.moduleService.getActiveModules().subscribe(res => {
      if (res.isSuccess && res.data) {
        console.log('res data', res.data);
        //  directly keep array of lowercase names
        this.activeModules = res.data.map((m: any) => m.modulename.toLowerCase());
      }
    });
  }

  isModuleActive(moduleName: string): boolean {
    return this.activeModules.includes(moduleName.toLowerCase());
  }


}
