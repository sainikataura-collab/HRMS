import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalSubmissionComponent } from './final-submission.component';

describe('FinalSubmissionComponent', () => {
  let component: FinalSubmissionComponent;
  let fixture: ComponentFixture<FinalSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalSubmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
