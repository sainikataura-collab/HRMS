import { Injectable } from '@angular/core';


import Swal, { SweetAlertIcon } from 'sweetalert2';



@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  confirmAction(message: string='Do you want to confirm?', title: string = 'Are you sure?'): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, confirm',
      cancelButtonText: 'Cancel',
      width: '280px',  // Smaller width
      padding: '5px', // Reduce padding
      iconColor: '#ff9900', // Softer warning color
      customClass: {
        popup: 'custom-popup',
        title: 'custom-title',
        htmlContainer: 'custom-text',
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button',
        icon: 'custom-icon'
      }
    }).then((result) => result.isConfirmed);

    // return Swal.fire({
    //   title: "Do you want to save the changes?",
    //   showDenyButton: true,
    //   showCancelButton: true,
    //   confirmButtonText: "Save",
    //   denyButtonText: `Don't save`
    // }).then((result) => result.isConfirmed);
  }

  showNotification(message: string = '', icon: string = 'success'): void {
    const validIcons: SweetAlertIcon[] = ['success', 'error', 'warning', 'info', 'question'];
    
    // Ensure the icon is of a valid type, otherwise default to 'info'
    const alertIcon: SweetAlertIcon = validIcons.includes(icon as SweetAlertIcon) ? (icon as SweetAlertIcon) : 'info';
  
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: alertIcon, // Now it's correctly cast
      title: message,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      customClass: {
        popup: 'custom-toast',
      }
    });
  }

  
  

}
