import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateQualificationDetailsComponent } from './candidate-qualification-details.component';

describe('CandidateQualificationDetailsComponent', () => {
  let component: CandidateQualificationDetailsComponent;
  let fixture: ComponentFixture<CandidateQualificationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateQualificationDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateQualificationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
