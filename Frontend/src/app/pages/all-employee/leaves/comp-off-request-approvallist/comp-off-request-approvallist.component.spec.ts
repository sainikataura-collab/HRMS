import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOffRequestApprovallistComponent } from './comp-off-request-approvallist.component';

describe('CompOffRequestApprovallistComponent', () => {
  let component: CompOffRequestApprovallistComponent;
  let fixture: ComponentFixture<CompOffRequestApprovallistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompOffRequestApprovallistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOffRequestApprovallistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
