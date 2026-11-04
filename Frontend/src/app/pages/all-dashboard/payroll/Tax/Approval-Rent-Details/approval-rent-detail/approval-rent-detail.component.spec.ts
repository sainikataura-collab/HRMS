import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalRentDetailComponent } from './approval-rent-detail.component';

describe('ApprovalRentDetailComponent', () => {
  let component: ApprovalRentDetailComponent;
  let fixture: ComponentFixture<ApprovalRentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalRentDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalRentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
