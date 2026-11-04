import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendaceComponent } from './attendace.component';

describe('AttendaceComponent', () => {
  let component: AttendaceComponent;
  let fixture: ComponentFixture<AttendaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
