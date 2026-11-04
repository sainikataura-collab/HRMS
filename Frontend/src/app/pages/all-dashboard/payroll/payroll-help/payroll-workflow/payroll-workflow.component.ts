import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';



@Component({
  selector: 'app-payroll-workflow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payroll-workflow.component.html',
  styleUrl: './payroll-workflow.component.scss'
})
export class PayrollWorkflowComponent {
  workflowSteps = [
    {
      title: 'HR Input',
      description: 'Start the salary preparation process with HR data input',
      filePath: 'assets/img/users/user-1.png',
      fileName: 'user-1.png'
    },
    {
      title: 'Verification',
      description: 'Confirm and validate employee attendance and work logs',
      filePath: 'assets/img/users/user-2.png',
      fileName: 'user-2.png'
    },
    {
      title: 'Manager Approval',
      description: 'Manager reviews and approves salary details',
      filePath: 'assets/img/users/user-3.png',
      fileName: 'user-3.png'
    },
    {
      title: 'Accounts Review',
      description: '',
      filePath: 'assets/img/users/user-4.png',
      fileName: 'user-4.png',
      subSteps: [
        { title: 'Fetch Data', description: 'Get data from HRMS', icon: '📥' },
        { title: 'Validate Logs', description: 'Ensure accuracy', icon: '✅' },
        { title: 'Submit', description: 'Forward to approval', icon: '📤' }
      ]
    },
    {
      title: 'Salary Processed',
      description: 'Finalize salary calculations and prepare for disbursal',
      filePath: 'assets/img/users/user-5.png',
      fileName: 'user-5.png'
    },
    {
      title: 'Bank Transfer',
      description: 'Initiate salary transfer to employee bank accounts',
      filePath: 'assets/img/users/user-6.png',
      fileName: 'user-6.png'
    },
    {
      title: 'Payslip Sent',
      description: 'Generate and send payslips to employees',
      filePath: 'assets/img/users/user-7.png',
      fileName: 'user-7.png'
    }
  ];



  payrollSteps = [
    {
      title: 'Collect Attendance',
      description: 'Gather daily attendance data for all employees',
      filePath: 'assets/files/user1/collect-attendance.pdf',
      fileName: 'collect-attendance.pdf'
    },
    {
      title: 'Leave Deductions',
      description: 'Calculate leave impact on salary',
      filePath: 'assets/files/user1/leave-deductions.pdf',
      fileName: 'leave-deductions'
    },
    {
      title: 'Salary Structure Review',
      description: 'Ensure all salary components are accurate',
      filePath: 'assets/files/user1/salary-structure.pdf',
      fileName: 'salary-structure'
    },
    {
      title: 'Overtime Calculation',
      description: 'Include eligible overtime hours in salary',
      filePath: 'assets/files/user1/overtime.pdf',
      fileName: 'overtime',
      subSteps: [
        {
          title: 'Apply OT Rate',
          description: 'Calculate amount',
          icon: '💹',
          important: true
        }
      ]
    },
    {
      title: 'Tax & Compliance',
      description: 'Apply necessary deductions and compliances',
      filePath: 'assets/files/user1/tax-compliance.pdf',
      fileName: 'tax-compliance',
      subSteps: [
        {
          title: 'TDS Calculation',
          description: 'Based on income slabs',
          icon: '📉',
          important: true
        }
      ]
    },
    {
      title: 'Salary Disbursement',
      description: 'Release salary for the month',
      filePath: 'assets/files/user1/salary-disbursement.pdf',
      fileName: 'salary-disbursement',
      subSteps: [
        {
          title: 'Bank Transfer',
          description: 'Send salary to banks',
          icon: '🏦',
          important: true
        }
      ]
    },
    {
      title: 'Payslip Generation',
      description: 'Generate and share payslips',
      filePath: 'assets/files/user1/payslip.pdf',
      fileName: 'payslip'
    }
  ];

  taxSteps = [
    {
      title: 'TDS Calculation',
      description: 'Compute Tax Deducted at Source based on salary',
      filePath: 'assets/files/user2/tds-calculation.pdf',
      fileName: 'tds-calculation',
      subSteps: [
        { title: 'Fetch Salary Data', description: 'Get gross salary for each employee', icon: '📊', important: true },
        { title: 'Apply Exemptions', description: 'Include HRA, LTA, and others', icon: '🛡', important: true },
        { title: 'Compute TDS', description: 'Based on income slabs and rules', icon: '📉', important: true }
      ]
    },
    {
      title: 'Tax Slab Validation',
      description: 'Ensure correct tax slabs are applied',
      filePath: 'assets/files/user2/tax-slab.pdf',
      fileName: 'tax-slab',
      subSteps: [
        { title: 'Check Age Slab', description: 'Senior citizen, super senior', icon: '👵', important: true },
        { title: 'Cross-check Slabs', description: 'Verify against latest FY', icon: '✅', important: true }
      ]
    },
    {
      title: 'Form 16 Preparation',
      description: 'Generate Form 16 for employees',
      filePath: 'assets/files/user2/form16.pdf',
      fileName: 'form16',
      subSteps: [
        { title: 'Compile TDS Details', description: 'All deductions and salary', icon: '📄', important: true },
        { title: 'Generate PDF', description: 'Auto-generate Form 16 format', icon: '🖨', important: true }
      ]
    },
    {
      title: 'Return Filing',
      description: 'File returns for organization',
      filePath: 'assets/files/user2/return-filing.pdf',
      fileName: 'return-filing',
      subSteps: [
        { title: 'Generate Challans', description: 'TRACES-compliant', icon: '💰', important: true },
        { title: 'Upload Return File', description: 'Via income tax portal', icon: '📤', important: true }
      ]
    },
    {
      title: 'Submission to Govt',
      description: 'Ensure legal compliance of all tax reports',
      filePath: 'assets/files/user2/submission.pdf',
      fileName: 'submission',
      subSteps: [
        { title: 'Verify Filing Status', description: 'Confirm with TRACES', icon: '🔍', important: true },
        { title: 'Download Receipt', description: 'Save acknowledgement', icon: '🧾', important: true }
      ]
    },
    {
      title: 'Employee Notification',
      description: 'Inform employees about tax filings',
      filePath: 'assets/files/user2/employee-notification.pdf',
      fileName: 'employee-notification',
      subSteps: [
        { title: 'Send Email', description: 'Mail Form 16 / info', icon: '📧', important: true },
        { title: 'Portal Update', description: 'Notify via ESS portal', icon: '🌐', important: true }
      ]
    }
  ];

  transactionSteps = [
    {
      title: 'Payment File Generation',
      description: 'Generate salary disbursement file as per bank format',
      filePath: 'assets/files/user3/payment-generation.xlsx',
      fileName: 'payment-generation.xlsx',
      subSteps: [
        { title: 'Prepare Format', description: 'Use bank-approved template', icon: '📝', important: true },
        { title: 'Include All Employees', description: 'Cross-check employee list', icon: '👥', important: true },
        { title: 'Secure File', description: 'Encrypt and validate file', icon: '🔐', important: true }
      ]
    },
    {
      title: 'Bank Upload',
      description: 'Upload payment file to the bank portal',
      filePath: 'assets/files/user3/bank-upload.pdf',
      fileName: 'bank-upload',
      subSteps: [
        { title: 'Login to Portal', description: 'Use authorized credentials', icon: '🔑', important: true },
        { title: 'File Submission', description: 'Upload and confirm file', icon: '📤', important: true }
      ]
    },
    {
      title: 'Transaction Authorization',
      description: 'Authorize uploaded transactions for processing',
      filePath: 'assets/files/user3/authorization.pdf',
      fileName: 'authorization',
      subSteps: [
        { title: 'Dual Authorization', description: 'Manager and finance team', icon: '✅', important: true },
        { title: 'Final Submit', description: 'Confirm to initiate transfer', icon: '🚀', important: true }
      ]
    },
    {
      title: 'Reconciliation',
      description: 'Match disbursed amounts with actual bank records',
      filePath: 'assets/files/user3/reconciliation.pdf',
      fileName: 'reconciliation',
      subSteps: [
        { title: 'Fetch Bank Report', description: 'Download from portal', icon: '📄', important: true },
        { title: 'Compare Entries', description: 'Match each transaction', icon: '🔍', important: true }
      ]
    },
    {
      title: 'Confirmation to Employees',
      description: 'Notify employees of salary credit',
      filePath: 'assets/files/user3/confirmation.pdf',
      fileName: 'confirmation',
      subSteps: [
        { title: 'Send SMS/Email', description: 'Automated notification', icon: '📩', important: true }
      ]
    },
    {
      title: 'Audit Logging',
      description: 'Log all activities for compliance and audit trail',
      filePath: 'assets/files/user3/audit-log.pdf',
      fileName: 'audit-log',
      subSteps: [
        { title: 'Track Actions', description: 'Capture all system actions', icon: '🧾', important: true },
        { title: 'Generate Report', description: 'Export for audit teams', icon: '📊', important: true }
      ]
    }
  ];

  exitSteps = [
    {
      title: 'Resignation Submission',
      description: 'Submit resignation via portal',
      filePath: 'assets/files/user4/resignation.pdf',
      fileName: 'resignation',
      subSteps: [
        { title: 'Fill Form', description: 'Basic details and reason', icon: '📝', important: true }
      ]
    },
    {
      title: 'Manager Review',
      description: 'Manager approval process',
      filePath: 'assets/files/user4/manager-review.pdf',
      fileName: 'manager-review',
      subSteps: [
        { title: 'Review & Approve', description: 'Confirm resignation', icon: '✅', important: true }
      ]
    },
    {
      title: 'HR Exit Interview',
      description: 'Final discussion with HR',
      filePath: 'assets/files/user4/exit-interview.pdf',
      fileName: 'exit-interview',
      subSteps: [
        { title: 'Conduct Interview', description: 'Feedback & policy check', icon: '🎤', important: true }
      ]
    },
    {
      title: 'Asset Handover',
      description: 'Return company assets',
      filePath: 'assets/files/user4/asset-handover.pdf',
      fileName: 'asset-handover',
      subSteps: [
        { title: 'Handover Items', description: 'Laptop, ID, etc.', icon: '📋', important: true }
      ]
    },
    {
      title: 'Final Settlement',
      description: 'Clear all dues',
      filePath: 'assets/files/user4/final-settlement.pdf',
      fileName: 'final-settlement',
      subSteps: [
        { title: 'Settle Accounts', description: 'Salary & leaves', icon: '💰', important: true }
      ]
    },
    {
      title: 'Exit Confirmation',
      description: 'Complete exit process',
      filePath: 'assets/files/user4/exit-confirmation.pdf',
      fileName: 'exit-confirmation',
      subSteps: [
        { title: 'Exit Letter', description: 'Relieving documentation', icon: '📄', important: true }
      ]
    },
    {
      title: 'Post Exit Feedback',
      description: 'Gather feedback from the employee',
      filePath: 'assets/Image/Appraisal.png',
      fileName: 'post-exit-feedback',
      subSteps: [
        { title: 'Send Feedback Form', description: 'Survey via email/portal', icon: '✉', important: true }
      ]
    }
  ];







  // download file
  errorMessage: string = '';

  downloadImage(filePath: string, fileName: string) {
    this.errorMessage = '';

    const img = new Image();
    img.src = filePath;

    img.onload = () => {
      const link = document.createElement('a');
      link.href = filePath;
      link.download = fileName;
      link.click();
    };

    img.onerror = () => {
      this.errorMessage = 'Error: Image not found or path is incorrect.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 2000);
    };
  }

  //








}