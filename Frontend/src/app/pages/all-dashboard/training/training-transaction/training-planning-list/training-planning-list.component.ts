import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { TrainingPlanningService } from '../../services/training-planning.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';

// Add this import for Bootstrap modal
declare var bootstrap: any;

// import { FullCalendarModule } from '@fullcalendar/angular';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import { CalendarOptions as FullCalendarOptions } from '@fullcalendar/core';





@Component({
  selector: 'app-training-planning-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxPaginationModule, FormsModule],
  templateUrl: './training-planning-list.component.html',
  styleUrl: './training-planning-list.component.scss'
})
export class TrainingPlanningListComponent {
calendarVisible: boolean = false; // default hidden

  searchText: string = '';
  TrainingData: any[] = [];



  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  Isedit: boolean = false;
  calendarData: any[] = []; // For calendar events
   
  employeeList: any[] = [];  // separate property for modal employees
    selectedProgram: any = null;


  constructor(private trainingplanningService: TrainingPlanningService, private toastrService: ToastrService,
    private route: ActivatedRoute, private router: Router, public encryptionService: EncryptionService,) { }

  ngOnInit(): void {
    
    this.getTraining();
  }


  onPageChange(event: number): void {
    this.pageIndex = event;
    //this.getTraining();
  }


  





// getTraining(): void {
//   this.trainingplanningService.get_trainingPlanning(this.pageIndex - 1, this.pageSize)
//     .subscribe(res => {
//       if (res.isSuccess) {
//         this.TrainingData = res.data;
//         this.totalItems = res.totalCount;

//         // 🔹 Map scheduled trainings to calendar events
//         // this.calendarData = this.TrainingData
//         //   .filter(t => t.tniStatus === 'Scheduled')
//         //   .map(t => ({
//         //     id: t.calendarId,                       // calendarId from API
//         //     title: `${t.programName} - ${t.subProgramName} (${t.trainer})`,
//         //     start: t.calendardate || t.trainingDateTime // Use calendardate first, fallback to trainingDateTime
//         //   }));

//         //  this.calendarOptions.events = this.calendarData;
//       } else {
//         console.error('Failed to retrieve data:', res.message);
//       }
//     });
// }
getTraining(): void {
  this.trainingplanningService.get_trainingPlanning(this.pageIndex - 1, this.pageSize)
    .subscribe(res => {
      if (res.isSuccess) {
        // 🔄 Process and normalize status
        this.TrainingData = (res.data || []).map((item: { tniStatus: string; }) => ({
          ...item,
          tniStatusArray: item.tniStatus?.split(',').map((s: string) => s.trim()) || []
        }));

        this.totalItems = res.totalCount;

      } else {
        console.error('Failed to retrieve data:', res.message);
      }
    });
}


  filteredData() {
    if (!this.searchText) {
      return this.TrainingData;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.TrainingData.filter(planning =>
      planning.trainingTitle?.toLowerCase().includes(searchTextLower) ||
      planning.trainer?.toLowerCase().includes(searchTextLower) ||
      planning.location?.toLowerCase().includes(searchTextLower)
    );
  }













  deleteplanning(planningid: number) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.trainingplanningService.delete_trainingPlanning(planningid).subscribe(
        (response: any) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message);
            this.getTraining(); // Refresh the list
          } else {
            this.toastrService.error(response.message, 'Error');
          }
        },
        (errorMessage) => {
          console.error('Error deleting record', errorMessage);
          this.toastrService.error(errorMessage, 'Error');

        }
      );
    }
  }


  isUpdate(planningId: number) {
    // console.log(addressId);
    const encryptedId = this.encryptionService.encryptText(planningId.toString());
    this.router.navigate(["/dash/training/trainingdashboard/TrainingPlanning", encryptedId]);

  }




  exportToExcel(): void {
    this.trainingplanningService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['pk_planningId', 'fk_InstituteId', 'approval', 'departmentCount', 'roleCount', 'empCount',];

        const columnMappings: Record<string, string> = {
          trainingTitle:'Training Title',
          trainer: 'Trainer',
          location: 'Location',
          trnCharge: 'Trainging Charge',
          duration:'Duration'

        };

        const filteredData = res.data.map((item: Record<string, any>) => {
          return Object.keys(item)
            .filter(key => !excludedColumns.includes(key))
            .reduce((obj: Record<string, any>, key: string) => {
              obj[columnMappings[key] || key] = item[key];
              return obj;
            }, {});
        });

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // *Direct Download (Without FileSaver)*
        const fileName = 'Training_Planning_List.xlsx';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(data);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        this.toastrService.warning('No data available to export');
      }
    });
  }


 scheduleTraining(item: any) {
  // navigate to planning create page, pass tniId
  this.router.navigate(['/dash/training/trainingdashboard/Admin_Training_Calendar'], {
    queryParams: {
      pk_planningId: item.pk_planningId,
       fk_TNIId: item.fk_TNIId, 
    }
  });
  
}
 RescheduleTraining(item: any) {
  // navigate to planning create page, pass tniId
  this.router.navigate(['/dash/training/trainingdashboard/Admin_Training_Calendar'], {
    queryParams: {
      pk_planningId: item.pk_planningId,
       fk_TNIId: item.fk_TNIId, 
    }
  });

  
  
}

 viewemployee(item: any) {
  debugger
    //  const encryptedTniId = this.encriptService.encryptText(item.pk_TNIId.toString());
  const encryptedProgramId = this.encryptionService.encryptText(item.fk_programId.toString());
  const encryptedSubProgramId = this.encryptionService.encryptText(item.fk_subprogramId.toString());


  // navigate to planning create page, pass tniId
  this.router.navigate(['/dash/training/trainingdashboard/All_Employees'], {
    queryParams: {
      // programId: item.fk_programId,
      //  subprogramId: item.fk_subprogramId, 
        programId:encryptedProgramId,
       subprogramId: encryptedSubProgramId , 
    }
  });






  // getTraining(): void {

  //   this.trainingplanningService.get_trainingPlanning(this.pageIndex - 1, this.pageSize).subscribe(res => {
  //     if (res.isSuccess) {
  //       this.TrainingData = res.data;
  //       this.totalItems = res.totalCount;
  //     } else {
  //       console.error('Failed to retrieve data:', res.message);

  //     }
  //   });
  // }

//  handleEventClick(arg: any) {
//   const event = this.TrainingData.find(
//     t => t.calendarId == arg.event.id
//   );

//   if (event) {
//     alert(`
//         Training: ${event.programName} - ${event.subProgramName}
//         Trainer: ${event.trainer}
//         Location: ${event.location}
//         Date: ${event.calendardate || event.trainingDateTime}
//         Calendar ID: ${event.calendarId}
//     `);
//   }
// }

 }
}

