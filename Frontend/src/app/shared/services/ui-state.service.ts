import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  private cameraModeSubject = new BehaviorSubject<boolean>(false);
  cameraMode$ = this.cameraModeSubject.asObservable();

  setCameraMode(value: boolean) {
    this.cameraModeSubject.next(value);
  }
}
