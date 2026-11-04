import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexiHeadBillApprovalComponent } from './flexi-head-bill-approval.component';

describe('FlexiHeadBillApprovalComponent', () => {
  let component: FlexiHeadBillApprovalComponent;
  let fixture: ComponentFixture<FlexiHeadBillApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexiHeadBillApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlexiHeadBillApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
