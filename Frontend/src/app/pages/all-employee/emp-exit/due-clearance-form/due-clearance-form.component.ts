import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { DueClearanceService } from '../Services/due-clearance.service';

@Component({
    selector: 'app-due-clearance-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        NgSelectModule
    ],
    templateUrl: './due-clearance-form.component.html',
    styleUrl: './due-clearance-form.component.scss'
})
export class DueClearanceFormComponent implements OnInit {

    assetForm!: FormGroup;

    empInfo: any = {};

    issuedOptions = [
        { name: 'Yes', value: true },
        { name: 'No', value: false }
    ];

    statusOptions = [
        { name: 'Returned', value: 'Returned' },
        { name: 'Not Returned', value: 'Not Returned' },
        { name: 'Lost', value: 'Lost' },
        { name: 'Damaged', value: 'Damaged' },
        { name: 'Missing', value: 'Missing' },
        { name: 'No Due', value: 'No Due' }
    ];

    constructor(
        private fb: FormBuilder,
        private dueClearanceService: DueClearanceService,
        private toastr: ToastrService,
        private router: Router,
        private route: ActivatedRoute,
        private encryptionService: EncryptionService
    ) { }

    ngOnInit(): void {

        this.assetForm = this.fb.group({
            assets: this.fb.array([])
        });

        this.getDueClearance();
    }

    get assets(): FormArray {
        return this.assetForm.get('assets') as FormArray;
    }

    getGroup(index: number): FormGroup {
        return this.assets.at(index) as FormGroup;
    }

    getDueClearance(): void {
        const encryptedEmpId = this.route.snapshot.queryParamMap.get('empId') || '';
        let empId = '';
        if (encryptedEmpId) {
            empId = this.encryptionService.decryptText(encryptedEmpId);
        }

        this.dueClearanceService.getDueClearance(empId).subscribe({

            next: (res: any) => {

                if (!(res?.isSuccess || res?.IsSuccess)) {
                    this.toastr.error('Unable to load due clearance.');
                    return;
                }

                this.empInfo =
                    res.data?.clearanceDepartmentUser ||
                    res.Data?.clearanceDepartmentUser;

                const assets =
                    res.data?.transactions ||
                    res.Data?.transactions ||
                    [];

                this.assets.clear();

                assets.forEach((x: any) => {

                    this.assets.push(this.fb.group({

                        name: [x.assetName],

                        issued: [x.isIssued],

                        status: [x.assetStatus],

                        recoveryAmount: [x.recoveryAmount],

                        remarks: [x.remarks]

                    }));

                });

            },

            error: () => {

                this.toastr.error('Something went wrong.');

            }

        });

    }

    totalRecovery(): number {

        return this.assets.controls.reduce((sum: number, g: any) => {

            return sum + Number(g.get('recoveryAmount')?.value || 0);

        }, 0);

    }

    goBack(): void {
        const encryptedEmpId = this.route.snapshot.queryParamMap.get('empId');
        if (encryptedEmpId) {
            this.router.navigate(['/dash/exit/exitdashboard/due_clearance_review']);
        } else {
            this.router.navigate(['/dash/emp-exit/emp-exitdashboard/due_clearance_list']);
        }
    }

}