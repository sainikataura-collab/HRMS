
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { ChangeWebUser } from '../../services/change-web-user.service';


@Component({
  selector: 'app-change-web-user',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,CommonModule,NgSelectComponent],
  templateUrl: './change-web-user.component.html',
  styleUrl: './change-web-user.component.scss'
})
export class ChangeWebUserComponent {

  ChangeWebUser!:FormGroup;
 

    
  constructor(private fb: FormBuilder,private httpservice:ChangeWebUser) {
    // ✅ Properly initialize FormGroup
    
  }

  
  ngOnInit() {
    this.ChangeWebUser = this.fb.group({
      Code: [''],
      Name: [''],
      selectedLocations:[],
      selectedDepartment:[],
      selectstatus: [],
      selectempcode:[],
      
      password:[],
    });


  }

  
  Location = [
    { name: '-- Select Location --', value: '' },
    { name: 'Ahemdabad', value: 'GJ-12' },
    { name: 'Alwar', value: 'RJ-77' },
    { name: 'Ambala', value: 'HR-20' },
    { name: 'Ankleshwar', value: 'GJ-66' },
    { name: 'Ashram', value: 'DL-32' },
    { name: 'Aurangabad', value: 'MH-44' },
    { name: 'Azamgarh', value: 'UP-50' },
    { name: 'Bahdrachalam', value: 'TS-52' },
    { name: 'Bangalore', value: 'KA-19' },
    { name: 'Bareily', value: 'UP-81' },
    { name: 'Baroda', value: 'GJ-27' },
    { name: 'Bhadrachalam', value: 'TS-61' },
    { name: 'Bhagwanpur', value: 'UK-9' },
    { name: 'Bhiwadi', value: 'RJ-53' },
    { name: 'Bhiwandi', value: 'MH-16' },
    { name: 'Bhopal', value: 'MP-7' },
    { name: 'Bhubaneswar', value: 'OD-21' },
    { name: 'Budhini', value: 'MP-50' },
    { name: 'Chennai', value: 'TN-43' },
    { name: 'Cochin', value: 'KL-24' },
    { name: 'Coimbatore', value: 'TN-69' },
    { name: 'D 28 (Haridwar)', value: 'UK-85' },
    { name: 'Delhi', value: 'DL-78' },
    { name: 'Faridabad', value: 'HR-49' },
    { name: 'Gajraula', value: 'UP-48' },
    { name: 'Ganganagar', value: 'RJ-55' },
    { name: 'Gwalior', value: 'MP-58' },
    { name: 'Goa', value: 'GA-41' },
    { name: 'Gopalpur', value: 'OD-4' },
    { name: 'Gurgaon', value: 'HR-1' },
    { name: 'Guwahati', value: 'AS-15' },
    { name: 'Haldia', value: 'WB-13' },
    { name: 'Haridwar', value: 'UK-64' },
    { name: 'Hyderabad', value: 'TS-8' },
    { name: 'Indore', value: 'MP-38' },
    { name: 'Jaipur', value: 'RJ-25' },
    { name: 'Jalna', value: 'MH-59' },
    { name: 'Jammu', value: 'JK-65' },
    { name: 'Jamnagar', value: 'GJ-72' },
    { name: 'Jamshedpur', value: 'JH-80' },
    { name: 'Kandla', value: 'GJ-34' },
    { name: 'Kanpur', value: 'UP-31' },
    { name: 'Kashipur', value: 'UK-73' },
    { name: 'Kolkata', value: 'WB-14' },
    { name: 'Lucknow', value: 'UP-6' },
    { name: 'Ludhiana', value: 'PB-33' },
    { name: 'Mumbai', value: 'MH-74' },
    { name: 'Mysore', value: 'KA-67' },
    { name: 'Nagpur', value: 'MH-17' },
    { name: 'Noida', value: 'UP-29' },
    { name: 'Padartha', value: 'UK-2' },
    { name: 'Patna', value: 'BR-10' },
    { name: 'Pune', value: 'MH-42' },
    { name: 'Raipur', value: 'CG-30' },
    { name: 'Ranchi', value: 'JH-75' },
    { name: 'Roorkee', value: 'UK-40' },
    { name: 'Rudrapur', value: 'UK-11' },
    { name: 'Sitarganj', value: 'UK-28' },
    { name: 'Sonipat', value: 'HR-5' },
    { name: 'Tejpur', value: 'AS-76' },
    { name: 'Vapi', value: 'GJ-22' },
    { name: 'Varanasi', value: 'UP-83' },
    { name: 'Vijayawada', value: 'AP-47' },
    { name: 'Zirakpur', value: 'PB-54' }
  ];
  
  Department = [
    { name: '-- Select Department --', value: '' },
    { name: '3PL Operations', value: '3PL' },
    { name: 'Accounts', value: 'Accounts' },
    { name: 'Admin', value: 'Admin' },
    { name: 'Customer Service', value: 'CS' },
    { name: 'Dairy', value: 'Dairy' },
    { name: 'Dairy Division', value: 'Dairy' },
    { name: 'ERP (Webex)', value: 'ERP' },
    { name: 'Finance & Accounts', value: 'Finance' },
    { name: 'Fleet Management', value: 'Fleet' },
    { name: 'Fleet Operations', value: 'FleetOps' },
    { name: 'HOD Office', value: 'HOD' },
    { name: 'HR & Facilities', value: 'HR' },
    { name: 'Human Resource', value: 'HR' },
    { name: 'Information Technology', value: 'IT' },
    { name: 'Insurance', value: 'Insurance' },
    { name: 'Legal', value: 'Legal' },
    { name: 'Maintenance', value: 'Maintenance' },
    { name: 'Milk Division', value: 'Milk' },
    { name: 'Network & Tracking Mgt', value: 'Tracking' },
    { name: 'Operations', value: 'Ops' },
    { name: 'Padartha', value: 'Padartha' },
    { name: 'Petrol Bunk', value: 'Petrol' },
    { name: 'Ruchi Soya Operation', value: 'RuchiOps' },
    { name: 'Sales & Marketing', value: 'Sales' },
    { name: 'Sales & Operations', value: 'SalesOps' },
    { name: 'Tour & Travels', value: 'Travel' },
    { name: 'Warehouse Operation', value: 'Warehouse' },
    { name: 'Workshop & Maintenance', value: 'Workshop' }
  ];

  Status = [
    { name: 'Current', value: 'current' },
    { name: 'Left', value: 'Left' }, 
    { name: 'All', value: 'All' }, 
    
  ];
 
  empcode = [
    { name: '-- Select Employee --', value: '' },
    { name: 'PP00001 | Varsha Mehta', value: 'GU-512' },
    { name: 'PP001 | S.N Malviya', value: 'GU-1' },
    { name: 'PP003 | Shivam Arora', value: 'GU-3' },
    { name: 'PP004 | Jagat Singh', value: 'GU-4' },
    { name: 'PP014 | Jay Singh', value: 'GU-12' },
    { name: 'PP015 | Padam Joshi', value: 'GU-13' },
    { name: 'PP018 | Narender Kumar', value: 'GU-15' },
    { name: 'PP021 | Jitender Singh', value: 'GU-17' },
    { name: 'PP023 | Dinesh Kumar', value: 'GU-19' },
    { name: 'PP027 | Rampal', value: 'GU-21' },
    { name: 'PP029 | Aman Sharma', value: 'GU-22' },
    { name: 'PP030 | Sumit Kumar', value: 'GU-23' },
    { name: 'PP059 | Sandeep Rathore', value: 'GU-24' },
    { name: 'PP061 | Ravi Sharma', value: 'GU-25' },
    { name: 'PP068 | Chain Pal', value: 'GU-26' },
    { name: 'PP070 | Sandeep Kumar', value: 'GU-27' },
    { name: 'PP073 | Sanjay Kumar', value: 'GU-28' },
    { name: 'PP074 | Mukesh Kumar', value: 'GU-29' },
    { name: 'PP088 | Prem', value: 'GU-30' },
    { name: 'PP099 | Munesh Kumar', value: 'GU-31' },
    { name: 'PP1001 | Anoop Kumar Shukla', value: 'GU-385' },
    { name: 'PP1003 | Udit Kumar', value: 'GU-386' },
    { name: 'PP1005 | Hemant Kumar', value: 'GU-306' },
    { name: 'PP1006 | Menpal', value: 'GU-307' },
    { name: 'PP1009 | Sunny Sharma', value: 'GU-310' },
    { name: 'PP101 | Akhilesh Chandra', value: 'GU-33' },
    { name: 'PP1010 | Ashish Shukla', value: 'GU-311' },
    { name: 'PP1016 | Akhilesh', value: 'GU-316' },
    { name: 'PP1019 | Dasaram Nandkishor Gilorkar', value: 'GU-318' },
    { name: 'PP102 | Praveen Chaturvedi', value: 'GU-34' },
    { name: 'PP1021 | Amit Kumar', value: 'GU-319' },
    { name: 'PP1023 | Purnima Chauhan', value: 'GU-320' },
    { name: 'PP1024 | Arbind Kumar', value: 'GU-321' },
    { name: 'PP1025 | Shailendra Kumar Mishra', value: 'GU-322' },
    { name: 'PP1026 | Amit Pal', value: 'GU-323' },
    { name: 'PP1029 | Prashant Panwar', value: 'GU-326' },
    { name: 'PP1030 | Shivam Ghosh', value: 'GU-327' },
    { name: 'PP1031 | Girish Saini', value: 'GU-328' },
    { name: 'PP1033 | Mayank Aswal', value: 'GU-330' },
    { name: 'PP1035 | Rakesh Kumar Pandey', value: 'GU-332' },
    { name: 'PP1038 | Shailendra Kumar Pandey', value: 'GU-335' },
    { name: 'PP104 | Rajiv Kumar', value: 'GU-35' },
    { name: 'PP1040 | Sumit Kumar', value: 'GU-336' },
    { name: 'PP1041 | Kapil Kumar', value: 'GU-337' },
    { name: 'PP1042 | Lakshya Kumar Sharma', value: 'GU-338' },
    { name: 'PP1044 | Akhilesh Kumar Singh', value: 'GU-340' },
    { name: 'PP1047 | Mohit', value: 'GU-342' },
    { name: 'PP1048 | Dinesh Singh Sontiyal', value: 'GU-343' },
    { name: 'PP1049 | Alok Mishra', value: 'GU-344' },
    { name: 'PP1053 | Arun Kumar Dubey', value: 'GU-347' },
    { name: 'PP1059 | Mukul Kumar', value: 'GU-351' },
    { name: 'PP1063 | Manish Kumar', value: 'GU-355' },
    { name: 'PP1065 | Bhola Kumar Sah', value: 'GU-357' },
    { name: 'PP1069 | Harshit Pandey', value: 'GU-360' },
    { name: 'PP1071 | Ravinder Yadav', value: 'GU-405' },
    { name: 'PP1072 | Dinesh Kumar', value: 'GU-406' },
    { name: 'PP1073 | Rajeev Kumar Raushan', value: 'GU-407' },
    { name: 'PP1075 | Pranshu Pandey', value: 'GU-409' },
    { name: 'PP1077 | Anil Kumar', value: 'GU-411' },
    { name: 'PP1078 | Chandra Prakash Dwivedi', value: 'GU-412' }
  ];




  submitSearchForm() {
    

    if (this.ChangeWebUser.invalid) {
      console.log("check data",this.ChangeWebUser)
      alert("Please fill out all required fields!");
      return;
    }

    const formData = { ...this.ChangeWebUser.value };
    alert("Form Submitted Successfully!\n\n" + JSON.stringify(formData, null, 2));
    // console.log(formData);
  this.httpservice.inert(formData).subscribe((res => {
  if(res.isSuccess){
    sessionStorage.clear()
  
    
}
else{
 
}

    }
    ))
  }



  // 

  restePassword() {
    if (this.ChangeWebUser.invalid) {
        console.log("Check data", this.ChangeWebUser);
        alert("Please fill out all required fields!");
        return;
    }

    // Reset only specific form fields (excluding selection fields)
    // this.ChangeWebUser.patchValue({
    //     Code: '',
    //     Name: '',
    //     password: 'New@Password123', // Set a new password
    //     selectedLocations: [],
    //     selectedDepartment: [],
    //     selectstatus: '',
    //     selectempcode: ['tgfgf']
    // });

    const formData = { ...this.ChangeWebUser.value };

    alert("Form Reset Successfully!\n\n" + JSON.stringify(formData, null, 2));
}

  
}


