import { Directive, ElementRef, HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Directive({
  selector: '[appMaxday]',
  standalone: true
})
export class MaxdayDirective {

  constructor(private el: ElementRef,private toastrservice:ToastrService ) {}


  private maxDay = 31;
  private minDay = 0;


  @HostListener('input', ['$event'])
  onInput(event: any) {
    let value = event.target.value;

    if (value > this.maxDay) {
      this.el.nativeElement.value = this.maxDay;
      this.toastrservice.error('sorry! you can not  enter more than 31 days.');
     // alert('');
    } else if (value < this.minDay) {
      this.el.nativeElement.value = this.minDay;
    }
  }

}
