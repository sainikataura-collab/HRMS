import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TravelRateService } from '../../../all-dashboard/travel _expense/TravelService/travel-rate.service';
import { LocalTravelService } from '../Services/local-travel.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-apply-local-travel',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NgSelectComponent],
  templateUrl: './local-travel.component.html',
  styleUrl: './local-travel.component.scss'
})
export class LocalTravelComponent implements OnInit {
  ngxUILoaderService = inject(NgxUiLoaderService);

  ApplyLocalTravel!: FormGroup;

  // NEW: Separate tracking for date section and detail entries
  currentDateTransaction: any = null; // Current date/time being worked on
  localTravelDetailsList: any[] = []; // Detail entries for current date
  allDateSections: any[] = []; // All completed date sections with their details

  // OLD: Keep for compatibility but will be used differently
  localTravelDateTransactionList: any[] = [];

  showError = false;
  submitted = false;
  selectedFiles: { [key: number]: File | null } = {};

  fileToUpload: File | null = null;
  ImageUrl: string = '';
  FileName: string = '';
  oldfile: string = '';

  // selectedFiles: { [key: number]: File | null } = {};

  // Edit tracking
  editIndex: number | null = null;
  editDateSectionIndex: number | null = null;
  pk_localtravelId: number | null = null;
  isEditMode = false;
  pk_localtraveIDateId: number | null = null;
  travelRateList: any[] = []; // To store travel rates

  // Dropdowns
  cityList: any[] = [];
  Modelist: any[] = [];
  yesNoOptions = [
    { value: 'true', name: 'Yes' },
    { value: 'false', name: 'No' }
  ];

  constructor(
    private fb: FormBuilder,
    private localTravelService: LocalTravelService,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private httpservice: TravelRateService,
    private encryptionService: EncryptionService // ✅ INJECT ENCRYPTION SERVICE
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadDropdowns();
    this.setupAutoCalculations();

    const encryptedId = this.route.snapshot.params['pk_localTravelId'];

    if (encryptedId) {
      // EDIT MODE - Route parameter exists
      try {
        const decryptedId = this.encryptionService.decryptText(encryptedId).toString();
        this.pk_localtravelId = Number(decryptedId);

        // Only load data if we have a valid ID
        if (this.pk_localtravelId && this.pk_localtravelId > 0) {
          this.isEditMode = true;
          this.getDataById(this.pk_localtravelId);
        } else {
          // Invalid ID from decryption
          this.pk_localtravelId = null;
          this.isEditMode = false;
        }
      } catch (error) {
        // Handle decryption error
        console.error('Error decrypting ID:', error);
        this.pk_localtravelId = null;
        this.isEditMode = false;
        this.toastrService.error('Invalid travel requisition ID', 'Error');
      }
    } else {
      // ADD MODE - No route parameter
      this.pk_localtravelId = null;
      this.isEditMode = false;
    }
  }

  isEdit(pk_localtravelId: number) {
    // Set edit mode
    this.pk_localtravelId = pk_localtravelId;  // Store the ID
    this.getDataById(this.pk_localtravelId);
    this.isEditMode = true; // Fetch data for this ID
  }

  /**
   * Initialize Form with nested groups
   * ✅ MODIFIED: Added rateEffectiveDate field
   */
  // private 
  initForm(): void {
    this.ApplyLocalTravel = this.fb.group({
      // Date Transaction Group
      dateTransaction: this.fb.group({
        traveldate: [null, Validators.required],
        fk_cityId: [null],
        InTime: ['', Validators.required],
        OutTime: ['', Validators.required],
        TotalHour: [''],
        fixedfda: [0],
      }),

      // Transaction Detail Group
      transactionDetail: this.fb.group({
        fk_travelmodeId: [null, Validators.required],
        purpose: ['', Validators.required],
        isexitingclienttype: [null, Validators.required],
        clientvisited: [''],
        newClient: [''],
        placefrom: [''],
        placeto: [''],
        kilometere: [0],
        rate: [0],
        effectivedate: [''], // ✅ ADDED: Rate Effective Date field
        amount: [0],
        othercharges: [0],
        otherchargesremarks: [''],
        totalamount: [{ value: 0, disabled: false }], //  CHANGED: Changed from disabled: true to false
        SavedFile: [''],
        filepath: ['']
      })
    });
  }

 
   loadDropdowns(): void {
    this.getTravelModelist('TravelMode');
    this.getTravelRateList();
  }

  getTravelRateList(): void {
    this.ngxUILoaderService.start();
    this.httpservice.get_TravelRate().subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.travelRateList = res.data;
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching travel rate list:', err);
        this.toastrService.error('Error fetching travel rate list.');
        this.ngxUILoaderService.stop();
      }
    });
  }

 
  getTravelModelist(fieldName: string): void {
    this.ngxUILoaderService.start();
    this.httpservice.getTravelMode(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.Modelist = res.data.map((item: any) => ({
            name: item.name,
            value: item.value
          }));
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching Mode list:', err);
        this.toastrService.error('Error fetching Mode list.');
        this.ngxUILoaderService.stop();
      }
    });
  }


  setupAutoCalculations(): void {
    const dateTransaction = this.ApplyLocalTravel.get('dateTransaction') as FormGroup;
    const transactionDetail = this.ApplyLocalTravel.get('transactionDetail') as FormGroup;

    // Calculate total hours when time changes
    dateTransaction.get('InTime')?.valueChanges.subscribe(() => this.calculateTotalHours());
    dateTransaction.get('OutTime')?.valueChanges.subscribe(() => this.calculateTotalHours());

    //  ADDED: When travel mode changes, fetch and set rate
    transactionDetail.get('fk_travelmodeId')?.valueChanges.subscribe((modeId) => {
      if (modeId) {
        this.setRateByTravelMode(modeId);
      }
    });

    //  ADDED: Calculate amount when KM or Rate changes
    transactionDetail.get('kilometere')?.valueChanges.subscribe(() => {
      this.calculateAmount();
    });

    transactionDetail.get('rate')?.valueChanges.subscribe(() => {
      this.calculateAmount();
    });

    //  MODIFIED: Calculate total amount when amount or other charges change
    transactionDetail.get('amount')?.valueChanges.subscribe(() => {
      this.calculateTotalAmountField();
    });

    transactionDetail.get('othercharges')?.valueChanges.subscribe(() => {
      this.calculateTotalAmountField();
    });
  }

  
  setRateByTravelMode(modeId: string): void {
    const transactionDetail = this.ApplyLocalTravel.get('transactionDetail') as FormGroup;

   // console.log(' Looking for rate with modeId:', modeId);
   // console.log(' Available rates:', this.travelRateList);

    //  FIXED: Match with travelmode name instead of ID
    // First, get the travel mode name from the selected ID
    const selectedMode = this.Modelist.find(
      (mode) => mode.value === modeId || mode.value === Number(modeId)
    );

    if (!selectedMode) {
      console.warn(' Travel mode not found in Modelist');
      return;
    }

    console.log('Selected mode name:', selectedMode.name);

    //  FIXED: Find rate by matching travelmode name (case-insensitive)
    const rateInfo = this.travelRateList.find(
      (rate) => rate.travelmode?.toLowerCase() === selectedMode.name?.toLowerCase()
    );

    console.log(' Found rate info:', rateInfo);

    if (rateInfo) {
      //  FIXED: Use correct property names from API
      transactionDetail.patchValue({
        rate: rateInfo.rate || 0,
 effectivedate: rateInfo.effectivedate || ''
        // rateEffectiveDate: this.parseEffectiveDate(rateInfo.effectivedate) // Convert "17 Feb 2026" to "2026-02-17"
      }, { emitEvent: true });

      console.log('Rate set:', rateInfo.rate);

      // Recalculate amount if KM is already entered
      this.calculateAmount();

      this.toastrService.success(`Rate ${rateInfo.rate} applied for ${selectedMode.name}`);
    } else {
      // If no rate found, reset
      transactionDetail.patchValue({
        rate: 0,
        effectivedate: ''
      }, { emitEvent: true });

      console.warn(' No rate found for:', selectedMode.name);
      this.toastrService.warning('No rate found for selected travel mode');
    }
  }


   calculateAmount(): void {
    const transactionDetail = this.ApplyLocalTravel.get('transactionDetail') as FormGroup;

    const km = Number(transactionDetail.get('kilometere')?.value) || 0;
    const rate = Number(transactionDetail.get('rate')?.value) || 0;

    const amount = km * rate;

    transactionDetail.patchValue({
      amount: amount
    }, { emitEvent: true }); // This will trigger calculateTotalAmountField
  }


   calculateTotalAmountField(): void {
    const transactionDetail = this.ApplyLocalTravel.get('transactionDetail') as FormGroup;

    const amount = Number(transactionDetail.get('amount')?.value) || 0;
    const othercharges = Number(transactionDetail.get('othercharges')?.value) || 0;

    const totalamount = amount + othercharges;

    transactionDetail.patchValue({
      totalamount: totalamount
    }, { emitEvent: false }); // emitEvent false to avoid infinite loop
  }

 
  onFileSelected(event: any, forEditIndex?: number): void {
    const file: File = event.target.files[0];

    if (file) {
      // Validation
      if (file.size > 5 * 1024 * 1024) {
        this.toastrService.error('File size must be less than 5MB');
        event.target.value = '';
        return;
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.toastrService.error('Only PDF, JPG, JPEG, and PNG files are allowed');
        event.target.value = '';
        return;
      }

      // Set file
      // if (forEditIndex !== undefined) {
      //   this.selectedFiles[forEditIndex] = file;
      // } else {
      //   this.selectedFiles[this.localTravelDetailsList.length] = file;
      // }


    // ✅ Use correct index
    const currentIndex = forEditIndex !== undefined ? forEditIndex : this.localTravelDetailsList.length;
    this.selectedFiles[currentIndex] = file;

    this.fileToUpload = file;
    this.FileName = '';
    this.ImageUrl = '';
    //  REMOVED: this.oldfile = '';  // Don't clear old file

      // ✅ Update display properties
      // this.fileToUpload = file;
      // this.FileName = '';
      // this.ImageUrl = '';  // Clear URL when new file selected
     // this.oldfile = '';   // Clear old file

      this.toastrService.success('File selected: ' + file.name);
    }
  }


  calculateTotalHours(): void {
    const dateTransaction = this.ApplyLocalTravel.get('dateTransaction') as FormGroup;
    const inTime = dateTransaction.get('InTime')?.value;
    const outTime = dateTransaction.get('OutTime')?.value;

    if (inTime && outTime) {
      const inTimeParts = inTime.split(':');
      const outTimeParts = outTime.split(':');

      const inDate = new Date();
      inDate.setHours(parseInt(inTimeParts[0]), parseInt(inTimeParts[1]), 0);

      const outDate = new Date();
      outDate.setHours(parseInt(outTimeParts[0]), parseInt(outTimeParts[1]), 0);

      let diff = outDate.getTime() - inDate.getTime();

      if (diff < 0) {
        diff += 24 * 60 * 60 * 1000;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      dateTransaction.patchValue({
        TotalHour: `${hours}.${minutes.toString().padStart(2, '0')}`
      }, { emitEvent: false });
    }
  }

 

   validateGroup(group: FormGroup, message: string): boolean {
    if (group.invalid) {
      group.markAllAsTouched();
      this.toastrService.error(message);
      return false;
    }
    return true;
  }

  /**
   * Calculate total amount for display
   * ✅ NO CHANGE
   */
  calculateTotalAmount(): number {
    return this.allDateSections.reduce(
      (sum, section) => sum + Number(section.dateInfo.GTotal || 0),
      0
    );
  }

  /**
   * Calculate subtotal for current detail list
   * ✅ NO CHANGE
   */
  calculateCurrentSubTotal(): number {
    return this.localTravelDetailsList.reduce(
      (sum, item) => sum + Number(item.totalamount || 0),
      0
    );
  }

  /**
   * NEW: Add detail entry to current date section
   * ✅ MODIFIED: Added rateEffectiveDate to detailData
   */
  addLocalTravel(): void {
    const dateTransaction = this.ApplyLocalTravel.get('dateTransaction') as FormGroup;
    const transactionDetail = this.ApplyLocalTravel.get('transactionDetail') as FormGroup;

    // If this is the first detail for a new date, validate and store date section
    if (this.localTravelDetailsList.length === 0) {
      if (!this.validateGroup(dateTransaction, 'Please fill all required fields in Date/Time section.')) return;

      // Store current date transaction info
      this.currentDateTransaction = {
        traveldate: dateTransaction.value.traveldate,
        fk_cityId: dateTransaction.value.fk_cityId,
        cityname: this.getCityNameById(dateTransaction.value.fk_cityId),
        InTime: dateTransaction.value.InTime,
        OutTime: dateTransaction.value.OutTime,
        TotalHour: dateTransaction.value.TotalHour,
        fixedfda: +dateTransaction.value.fixedfda || 0
      };
    }

    // Validate detail section
    if (!this.validateGroup(transactionDetail, 'Please fill all required fields in Travel Details section.')) return;

    // Calculate amounts
    const amount = +transactionDetail.value.amount || 0;
    const othercharges = +transactionDetail.value.othercharges || 0;
    const totalamount = amount + othercharges;



  //  Correct index for file
  const currentIndex = this.editIndex !== null ? this.editIndex : this.localTravelDetailsList.length;
  const newFile = this.selectedFiles[currentIndex] || null;

  //  Preserve old filepath if no new file selected
  const existingFilepath = this.editIndex !== null
    ? this.localTravelDetailsList[this.editIndex].filepath
    : '';

  //  Preserve pk_localtraveIDateTrnId from original row
  const existingPkId = this.editIndex !== null
    ? this.localTravelDetailsList[this.editIndex].pk_localtraveIDateTrnId
    : 0;



    const detailData = {
          pk_localtraveIDateTrnId: existingPkId,          //  preserve original ID

      fk_travelmodeId: Number(transactionDetail.value.fk_travelmodeId),
     // description:transactionDetail.value.description,
      description: this.getTravelModeNameById(transactionDetail.value.fk_travelmodeId),
      purpose: transactionDetail.value.purpose,
      isexitingclienttype: transactionDetail.value.isexitingclienttype,
      clientvisited: transactionDetail.value.clientvisited,
      newClient: transactionDetail.value.newClient,
      placefrom: transactionDetail.value.placefrom,
      placeto: transactionDetail.value.placeto,
      kilometere: +transactionDetail.value.kilometere || 0,
      rate: +transactionDetail.value.rate || 0,
      effectivedate: transactionDetail.value.effectivedate || '', // ✅ ADDED
      amount: amount,
      othercharges: othercharges,
      totalamount: totalamount,
      otherchargesremarks: transactionDetail.value.otherchargesremarks,
          file: newFile,                                   // ✅ new File object if selected
    filepath: newFile ? '' : existingFilepath, 
     // file: this.selectedFiles[this.localTravelDetailsList.length] || null,
      isActive: true
    };

    // Add or update in detail list
    // if (this.editIndex !== null) {
    //   this.localTravelDetailsList[this.editIndex] = detailData;
    //   this.editIndex = null;
    //   this.toastrService.success('Detail entry updated');
    // } else {
    //   this.localTravelDetailsList.push(detailData);
    //   this.toastrService.success('Detail entry added');
    // }

    if (this.editIndex !== null) {
      this.localTravelDetailsList[this.editIndex] = detailData;
      //  ADD: Force change detection
      this.localTravelDetailsList = [...this.localTravelDetailsList];
      this.editIndex = null;
      this.toastrService.success('Detail entry updated');
    } else {
      this.localTravelDetailsList.push(detailData);
      //  ADD: Force change detection
      this.localTravelDetailsList = [...this.localTravelDetailsList];
      this.toastrService.success('Detail entry added');
    }

    // Reset only detail section (keep date section)
    this.resetDetailSectionOnly();
  }

  /**
   * ✅ NO CHANGE
   */
  completeDateSection(): void {
    if (!this.currentDateTransaction) {
      this.toastrService.error('Please fill in the date/time section first');
      return;
    }

    if (this.localTravelDetailsList.length === 0) {
      this.toastrService.error('Please add at least one travel detail for this date');
      return;
    }

    const subTotal = this.calculateCurrentSubTotal();
    const fixedfda = this.currentDateTransaction.fixedfda || 0;
    const GTotal = subTotal + fixedfda;

    const dateSection = {
      dateInfo: {
        pk_localtravelId: this.currentDateTransaction.pk_localtravelId || null,
        ...this.currentDateTransaction,
        subTotal: subTotal,
        GTotal: GTotal
      },
      details: [...this.localTravelDetailsList]
    };

    if (this.editDateSectionIndex !== null) {
      this.allDateSections[this.editDateSectionIndex] = dateSection;
      this.editDateSectionIndex = null;
      this.toastrService.success('Date section updated');
    } else {
      this.allDateSections.push(dateSection);
      this.toastrService.success('Date section completed and added');
    }

    this.currentDateTransaction = null;
    this.localTravelDetailsList = [];
    this.resetFormSections();
  }

  /**
   * Edit detail entry from current list
   * ✅ MODIFIED: Added rateEffectiveDate to patchValue
   */
  editLocalTravel(index: number): void {
    const item = this.localTravelDetailsList[index];
    const transactionDetail = this.ApplyLocalTravel.get('transactionDetail') as FormGroup;

    transactionDetail.patchValue({
      fk_travelmodeId: item.fk_travelmodeId.toString(),
      description: item.description,
      purpose: item.purpose,
      isexitingclienttype: item.isexitingclienttype,
      clientvisited: item.clientvisited,
      newClient: item.newClient,
      placefrom: item.placefrom,
      placeto: item.placeto,
      kilometere: item.kilometere,
      rate: item.rate,
      effectivedate: item.effectivedate, // ✅ ADDED
      amount: item.amount,
      othercharges: item.othercharges,
      otherchargesremarks: item.otherchargesremarks,
      filepath: item.filepath
    });

    console.log('Editing item with filepath:', item.filepath);

    // ✅ ADD THIS: Restore file object
  //   if (item.filepath) {
  //     this.oldfile = item.filepath;
  //     this.FileName = this.extractFileName(item.filepath);
  //     this.fileToUpload = null;  // Clear new file

  //     //  Load file URL for eye button
  //     this.loadFileUrl(item.filepath);
  //   }
    //  File display set karo
  if (item.filepath) {
    this.oldfile = item.filepath;
    this.FileName = this.extractFileName(item.filepath);
    this.fileToUpload = null;
    this.loadFileUrl(item.filepath);
  } else {
    //  IMPORTANT: Agar koi file nahi thi row mein
    this.oldfile = '';
    this.FileName = '';
    this.fileToUpload = null;
    this.ImageUrl = '';
  }

  //  selectedFiles mein koi purana file clear karo is index ka
  this.selectedFiles[index] = null;

  this.editIndex = index;
}




  /**
   * Delete detail entry from current list
   * ✅ NO CHANGE
   */
  deleteLocalTravel(index: number): void {
    if (confirm('Are you sure you want to remove this entry?')) {
      this.localTravelDetailsList.splice(index, 1);
      this.toastrService.success('Entry removed');

      // If no more details, clear current date transaction
      if (this.localTravelDetailsList.length === 0) {
        this.currentDateTransaction = null;
      }
    }
  }

  /**
   * NEW: Edit entire date section
   * ✅ NO CHANGE
   */
  editDateSection(index: number): void {
    const section = this.allDateSections[index];
    const dateTransaction = this.ApplyLocalTravel.get('dateTransaction') as FormGroup;

    // Load date info
    dateTransaction.patchValue({
      traveldate: this.parseDate(section.dateInfo.traveldate),
      fk_cityId: section.dateInfo.fk_cityId,
      InTime: section.dateInfo.InTime,
      OutTime: section.dateInfo.OutTime,
      TotalHour: section.dateInfo.TotalHour,
      fixedfda: section.dateInfo.fixedfda
    });

    // Load current date and details
    this.currentDateTransaction = { ...section.dateInfo };
    this.localTravelDetailsList = [...section.details];
    this.editDateSectionIndex = index;

    // Remove from final list temporarily
    this.allDateSections.splice(index, 1);

    this.toastrService.info('Date section loaded for editing');
  }

  /**
   * NEW: Delete entire date section
   * ✅ NO CHANGE
   */
  deleteDateSection(index: number): void {
    if (confirm('Are you sure you want to remove this entire date section with all its details?')) {
      this.allDateSections.splice(index, 1);
      this.toastrService.success('Date section removed');
    }
  }

 

saveLocalTravelForm(): void {
  if (this.currentDateTransaction && this.localTravelDetailsList.length > 0) {
    this.completeDateSection();
  }

  if (this.allDateSections.length === 0) {
    this.toastrService.error('Please complete and add at least one date section before submitting.');
    return;
  }

  const travelDates = this.allDateSections.map(section =>
    this.formatDateForAPI(section.dateInfo.traveldate)
  );

  const uniqueDates = new Set(travelDates);
  if (uniqueDates.size !== travelDates.length) {
    this.toastrService.error('Duplicate travel dates found. Please ensure each date is unique.');
    return;
  }

  const formData = new FormData();
  let masterIndex = 0;
  let detailIndex = 0;

  this.allDateSections.forEach(section => {
    const totalAmount = section.dateInfo.GTotal;

    formData.append(`LocalTravelRequisitionMst[${masterIndex}].pk_localtravelId`,
      String(section.dateInfo.pk_localtravelId || 0));
    formData.append(`LocalTravelRequisitionMst[${masterIndex}].traveldate`,
      this.formatDateForAPI(section.dateInfo.traveldate));
    formData.append(`LocalTravelRequisitionMst[${masterIndex}].fk_cityId`,
      section.dateInfo.fk_cityId || '');
    formData.append(`LocalTravelRequisitionMst[${masterIndex}].InTime`,
      section.dateInfo.InTime);
    formData.append(`LocalTravelRequisitionMst[${masterIndex}].OutTime`,
      section.dateInfo.OutTime);
    formData.append(`LocalTravelRequisitionMst[${masterIndex}].TotalHour`,
      section.dateInfo.TotalHour);
    formData.append(`LocalTravelRequisitionMst[${masterIndex}].subTotal`,
      String(section.dateInfo.subTotal));
    formData.append(`LocalTravelRequisitionMst[${masterIndex}].fixedfda`,
      String(section.dateInfo.fixedfda));
    formData.append(`LocalTravelRequisitionMst[${masterIndex}].GTotal`,
      String(section.dateInfo.GTotal));
    formData.append(`LocalTravelRequisitionMst[${masterIndex}].amount`,
      String(totalAmount));
    formData.append(`LocalTravelRequisitionMst[${masterIndex}].status`, '0');
    formData.append(`LocalTravelRequisitionMst[${masterIndex}].isSubmitted`, 'false');
    formData.append(`LocalTravelRequisitionMst[${masterIndex}].isApproved`, 'false');
    formData.append(`LocalTravelRequisitionMst[${masterIndex}].isActive`, 'true');

    //  UPDATED forEach block
    section.details.forEach((detail: any) => {

      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].pk_localtraveIDateTrnId`,
        String(detail.pk_localtraveIDateTrnId || 0));  //  correct ID
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].fk_localtravelId`,
        String(section.dateInfo.pk_localtravelId || 0));
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].fk_travelmodeId`,
        String(detail.fk_travelmodeId));
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].purpose`,
        detail.purpose);
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].isexitingclienttype`,
        detail.isexitingclienttype);
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].clientvisited`,
        detail.clientvisited || '');
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].newClient`,
        detail.newClient || '');
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].placefrom`,
        detail.placefrom || '');
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].placeto`,
        detail.placeto || '');
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].kilometere`,
        String(detail.kilometere));
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].rate`,
        String(detail.rate));
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].effectivedate`,
        String(detail.effectivedate || ''));
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].amount`,
        String(detail.amount));
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].othercharges`,
        String(detail.othercharges));
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].totalamount`,
        String(detail.totalamount));
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].isActive`, 'true');
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].otherchargesremarks`,
        detail.otherchargesremarks || '');

      //  OLD filepath send karo agar new file nahi select kiya
      formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].filepath`,
        detail.filepath || '');

      //  New file only agar select kiya
      if (detail.file) {
        formData.append(`LocalTravelRequisitionDateTransactionTrn[${detailIndex}].SavedFile`,
          detail.file, detail.file.name);
      }

      detailIndex++;
    });

    masterIndex++;
  });

  this.ngxUILoaderService.start();

  const apiCall = this.isEditMode && this.pk_localtravelId
    ? this.localTravelService.updateLocalTravel(formData)
    : this.localTravelService.insertLocalTravel(formData);

  apiCall.subscribe({
    next: (res) => {
      this.ngxUILoaderService.stop();
      if (res.isSuccess) {
        const message = this.isEditMode ? 'Updated Successfully' : 'Inserted Successfully';
        this.toastrService.success(message, res.message);
        this.router.navigate(['/dash/travelexpence_emp/travelexpence_empdashboard/localtravelList']);
      } else {
        this.toastrService.error(res.message || 'Operation failed');
      }
    },
    error: (err) => {
      this.ngxUILoaderService.stop();
      this.toastrService.error('Something went wrong');
    }
  });
}

  submitLocalTravelForm(): void {
  if (this.allDateSections.length === 0 && this.localTravelDetailsList.length === 0) {
    this.toastrService.error('Please add travel details before submitting.');
    return;
  }

  //  Confirmation
  if (!confirm('Are you sure you want to submit? You cannot edit after submission.')) {
    return;
  }

  this.ngxUILoaderService.start();

  //  Get employee ID from token
  const fk_empid = localStorage.getItem('userId') || ''; // Adjust based on your auth

  //  Call SUBMIT procedure (different from insert/update)
  this.localTravelService.submitLocalTravel(fk_empid).subscribe({
    next: (res) => {
      this.ngxUILoaderService.stop();
      if (res.isSuccess) {
        this.toastrService.success('Submitted successfully for approval!', res.message);
        this.router.navigate(['/dash/travelexpence_emp/travelexpence_empdashboard/localtravelList']);
      } else {
        this.toastrService.error(res.message || 'Submission failed');
      }
    },
    error: (err) => {
      this.ngxUILoaderService.stop();
      this.handleApiError(err);
    }
  });
}

/**
 * ✅ Error Handler
 */
private handleApiError(err: any): void {
  console.error('API Error:', err);

  let errorMessage = 'An error occurred';

  if (err?.error?.message) {
    errorMessage = err.error.message;
  } else if (err?.message) {
    errorMessage = err.message;
  }

  if (errorMessage.includes('Travel date is already inserted') || 
      errorMessage.includes('already exists')) {
    this.toastrService.error('This travel date has already been submitted.', 'Duplicate Entry');
  } else if (errorMessage.includes('Cannot update') || 
             errorMessage.includes('already submitted')) {
    this.toastrService.error('Cannot update a submitted request.', 'Edit Blocked');
  } else {
    this.toastrService.error(errorMessage, 'Error');
  }
}
  /**
   * ✅ MODIFIED: Added rateEffectiveDate to loaded data
   */
  // private 
  getDataById(pk_localtravelId: number): void {
    console.log('🔍 Fetching data for ID:', pk_localtravelId);

    this.ngxUILoaderService.start();
    this.localTravelService.getLocalTravelById(pk_localtravelId).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          const masterRecords = res.data.localTravelRequisitionMst || [];
          const detailTransactions = res.data.localTravelRequisitionDateTransactionTrn || [];

          if (masterRecords.length > 0) {
            const firstMaster = masterRecords[0];

            this.currentDateTransaction = {
              pk_localtravelId: firstMaster.pk_localtravelId,
              traveldate: firstMaster.traveldate,
              fk_cityId: firstMaster.fk_cityId,
              cityname: this.getCityNameById(firstMaster.fk_cityId),
              InTime: firstMaster.inTime,
              OutTime: firstMaster.outTime,
              TotalHour: firstMaster.totalHour,
              fixedfda: firstMaster.fixedfda,
              subTotal: firstMaster.subTotal,
              GTotal: firstMaster.gTotal
            };

            const dateTransaction = this.ApplyLocalTravel.get('dateTransaction') as FormGroup;
            dateTransaction.patchValue({
              traveldate: this.parseDate(firstMaster.traveldate),
              fk_cityId: firstMaster.fk_cityId,
              InTime: firstMaster.inTime,
              OutTime: firstMaster.outTime,
              TotalHour: firstMaster.totalHour,
              fixedfda: firstMaster.fixedfda
            });

            // ✅ Load details with file handling
            this.localTravelDetailsList = detailTransactions
              .filter((detail: any) => detail.fk_localtravelId === firstMaster.pk_localtravelId)
              .map((detail: any, index: number) => {

                // Load file info
                if (detail.filepath) {
                  this.oldfile = detail.filepath;
                  this.FileName = this.extractFileName(detail.filepath);
                  this.loadFileUrl(detail.filepath);
                }

                return {
                 // pk_id: detail.pk_id,
                  pk_localtraveIDateTrnId: detail.pk_localtraveIDateTrnId,
                  fk_travelmodeId: detail.fk_travelmodeId.toString(),
                  description: detail.description,
                  purpose: detail.purpose,
                  isexitingclienttype: detail.isexitingclienttype,
                  clientvisited: detail.clientvisited,
                  newClient: detail.newClient,
                  placefrom: detail.placefrom,
                  placeto: detail.placeto,
                  kilometere: detail.kilometere,
                  rate: detail.rate,
                  effectivedate: detail.effectivedate || '', // ✅ ADDED
                  amount: detail.amount,
                  othercharges: detail.othercharges,
                  totalamount: detail.totalamount,
                  otherchargesremarks: detail.otherchargesremarks,
                  filepath: detail.filepath,
                  isActive: true
                };
              });

            console.log('✅ Loaded into current section:', this.localTravelDetailsList);
            this.toastrService.success(`Loaded ${this.localTravelDetailsList.length} travel details for editing`);
          }
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('❌ Error fetching data:', err);
        this.toastrService.error('Error loading data');
        this.ngxUILoaderService.stop();
      }
    });
  }

  /**
   * ✅ Load file URL for viewing
   * ✅ NO CHANGE
   */
  // private 
  loadFileUrl(filename: string): void {
    if (!filename) return;

    this.localTravelService.getImage(filename).subscribe({
      next: (blob) => {
        this.ImageUrl = URL.createObjectURL(blob);
      },
      error: (err) => {
        console.error('Failed to load file:', err);
        this.ImageUrl = '';
      }
    });
  }

  /**
   * Extract filename from full path
   * ✅ NO CHANGE
   */
  // private 
  extractFileName(filepath: string): string {
    if (!filepath) return '';
    const parts = filepath.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Helper: Get city name by ID
   * ✅ NO CHANGE
   */
  getCityNameById(cityId: string): string {
    const found = this.cityList.find(c => c.id === cityId || c.value === cityId);
    return found ? found.name : '';
  }

  /**
   * Helper: Get travel mode name by ID
   * ✅ NO CHANGE
   */
  getTravelModeNameById(modeId: string): string {
    const found = this.Modelist.find(m => m.id === modeId || m.value === modeId);
    return found ? found.name : '';
  }

  /**
   * Helper: Parse date from MM/dd/yyyy to yyyy-MM-dd
   * ✅ NO CHANGE
   */
  // private 
  parseDate(dateString: string): string {
    if (!dateString) return '';

    const parts = dateString.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return dateString;
  }

  /**
   * Helper: Format date for API (yyyy-MM-dd to MM/dd/yyyy)
   * ✅ NO CHANGE
   */
  // private 
  formatDateForAPI(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  }

  /**
   * Reset only detail section (keep date section intact)
   * ✅ NO CHANGE
   */
  // private 
  resetDetailSectionOnly(): void {
    const transactionDetail = this.ApplyLocalTravel.get('transactionDetail') as FormGroup;
    transactionDetail.reset({
      kilometere: 0,
      rate: 0,
      amount: 0,
      othercharges: 0
    });

    // ✅ ADD THIS: Clear file-related fields
    this.fileToUpload = null;
    this.FileName = '';
    this.ImageUrl = '';
    this.oldfile = '';

    // ✅ Clear file input element
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Reset form sections after adding entry
   * ✅ NO CHANGE
   */
  // private 
  resetFormSections(): void {
    const dateTransaction = this.ApplyLocalTravel.get('dateTransaction') as FormGroup;
    const transactionDetail = this.ApplyLocalTravel.get('transactionDetail') as FormGroup;

    dateTransaction.reset({ fixedfda: 0 });
    transactionDetail.reset({
      kilometere: 0,
      rate: 0,
      amount: 0,
      othercharges: 0
    });

    this.ApplyLocalTravel.markAsPristine();
    this.ApplyLocalTravel.markAsUntouched();
  }

  /**
   * Reset all state
   * ✅ NO CHANGE
   */
  // private
  //  resetAll(): void {
  //   this.ApplyLocalTravel.reset();
  //   this.currentDateTransaction = null;
  //   this.localTravelDetailsList = [];
  //   this.allDateSections = [];
  //   this.localTravelDateTransactionList = [];
  //   this.pk_localtravelId = null;
  //   this.isEditMode = false;
  //   this.editIndex = null;
  //   this.editDateSectionIndex = null;
  // }

  /**
   * Reset entire form
   * ✅ NO CHANGE
   */
  resetForm(): void {
    //this.resetAll();
    this.toastrService.info('Form reset');
  }

  /**
   * Validate number input
   * ✅ NO CHANGE
   */
  validateNumber(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);

    if (charCode >= 48 && charCode <= 57) {
      return;
    }

    if (event.key === '.') {
      const inputValue = (event.target as HTMLInputElement).value;
      if (inputValue.includes('.')) {
        event.preventDefault();
      }
      return;
    }

    event.preventDefault();
  }
}