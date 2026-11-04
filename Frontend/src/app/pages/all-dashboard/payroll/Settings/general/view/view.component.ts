import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GeneralService } from '../../../../payroll/services/general.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent {

  codeDetails!: any; // Initialize as null
  codeId: string = '';
  codetypeId: string = '';
  codeType: string = '';

  constructor(

    private activateroute: ActivatedRoute, private httpservice: GeneralService, private tostr: ToastrService) {
  }
  ngOnInit() {
    this.codeId = this.activateroute.snapshot.paramMap.get('id') || ''
    this.activateroute.queryParams.subscribe(params => {
      this.codetypeId = params['codeTypeId'] || '';
      this.codeType = params['codeType'] || '';
    });
    this.httpservice.generalGetby(this.codeId, this.codetypeId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.codeDetails = res.data;

        }
        else {
          this.tostr.error(res.message)
        }
      }
    })
  }

}
