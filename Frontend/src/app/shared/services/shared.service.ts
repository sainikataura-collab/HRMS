import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  secretKey = 'hello';
  private loadCount: number = 0;
  loadState: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public cousesId = new Subject<string>();
  constructor() { }
   
  HideLoader() {
    this.loadCount = (this.loadCount ? --this.loadCount : 0);
    if (!this.loadCount)
       this.loadState.next(false);
  }
  ShowLoader() {
    this.loadCount+=1;
    this.loadState.next(true);    
  }
}
