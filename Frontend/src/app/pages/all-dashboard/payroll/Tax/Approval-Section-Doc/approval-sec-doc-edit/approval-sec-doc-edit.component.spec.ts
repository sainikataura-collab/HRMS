import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalSecDocEditComponent } from './approval-sec-doc-edit.component';

describe('ApprovalSecDocEditComponent', () => {
  let component: ApprovalSecDocEditComponent;
  let fixture: ComponentFixture<ApprovalSecDocEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalSecDocEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalSecDocEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
