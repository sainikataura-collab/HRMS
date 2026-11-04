import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalSecDocComponent } from './approval-sec-doc.component';

describe('ApprovalSecDocComponent', () => {
  let component: ApprovalSecDocComponent;
  let fixture: ComponentFixture<ApprovalSecDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalSecDocComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalSecDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
