import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthHeaderComponent } from "./components/auth-header/auth-header.component";
import { AuthFooterComponent } from "./components/auth-footer/auth-footer.component";
import { DashboardFooterComponent } from "./components/dashboard-footer/dashboard-footer.component";
import { DashboardHeaderComponent } from "./components/dashboard-header/dashboard-header.component";
import { DashboardSidebarComponent } from "./components/dashboard-sidebar/dashboard-sidebar.component";
import { WorkflowSidebarComponent } from "./components/workflow-sidebar/workflow-sidebar.component";

@NgModule({
    declarations: [ 
      AuthHeaderComponent,
      AuthFooterComponent,
      DashboardFooterComponent,
      DashboardHeaderComponent,
      DashboardSidebarComponent
    ],
    
    imports:[
        CommonModule,
        RouterModule,
        WorkflowSidebarComponent,
    ],
    exports:[
      AuthHeaderComponent,
      AuthFooterComponent,
      DashboardFooterComponent,
      DashboardHeaderComponent,
      DashboardSidebarComponent,
      WorkflowSidebarComponent,
    ],
    providers:[],
})

export class SharedModule { }
