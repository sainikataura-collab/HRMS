import { ValueAxis } from '@amcharts/amcharts5/.internal/charts/xy/axes/ValueAxis';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { CommonSearchComponent } from "../../Employee/common-search/common-search.component";

@Component({
  selector: 'app-export-import-employee',
  standalone: true,
  imports: [NgSelectComponent, CommonSearchComponent],
  templateUrl: './export-import-employee.component.html',
  styleUrl: './export-import-employee.component.scss'
})
export class ExportImportEmployeeComponent {

 ExportImportEmployee!:FormGroup;

  OfficeType = [
    { name: '-- Office Type --', value: '' },
    { name: 'Head Office', value: 'HD' }, 
    
  ];

  Grade=[
    {name: '--select Grade --', Value:''},
    {name:'A',value:'A'},
    {name:'ghjhjkkj', value:'ghjhjkkj'},
    {name:'NA',value:'NA'},
    {name:'No',value:'No'}

  ];
}
