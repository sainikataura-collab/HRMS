import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveDetailsStatusComponent } from './leave-details-status.component';

describe('LeaveDetailsStatusComponent', () => {
  let component: LeaveDetailsStatusComponent;
  let fixture: ComponentFixture<LeaveDetailsStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveDetailsStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveDetailsStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
