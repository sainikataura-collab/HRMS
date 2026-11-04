import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOffRequestApprovalComponent } from './comp-off-request-approval.component';

describe('CompOffRequestApprovalComponent', () => {
  let component: CompOffRequestApprovalComponent;
  let fixture: ComponentFixture<CompOffRequestApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompOffRequestApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOffRequestApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
