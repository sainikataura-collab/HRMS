import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateMedicalDetailsComponent } from './candidate-medical-details.component';

describe('CandidateMedicalDetailsComponent', () => {
  let component: CandidateMedicalDetailsComponent;
  let fixture: ComponentFixture<CandidateMedicalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateMedicalDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateMedicalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
