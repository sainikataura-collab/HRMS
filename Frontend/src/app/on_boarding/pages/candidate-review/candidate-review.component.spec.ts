import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateReviewComponent } from './candidate-review.component';

describe('CandidateReviewComponent', () => {
  let component: CandidateReviewComponent;
  let fixture: ComponentFixture<CandidateReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
