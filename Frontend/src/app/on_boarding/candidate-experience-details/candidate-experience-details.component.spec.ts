import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateExperienceDetailsComponent } from './candidate-experience-details.component';

describe('CandidateExperienceDetailsComponent', () => {
  let component: CandidateExperienceDetailsComponent;
  let fixture: ComponentFixture<CandidateExperienceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateExperienceDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateExperienceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
