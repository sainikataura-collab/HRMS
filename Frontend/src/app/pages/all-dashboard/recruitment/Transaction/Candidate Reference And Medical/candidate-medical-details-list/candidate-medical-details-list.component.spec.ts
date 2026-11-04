import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateMedicalDetailsListComponent } from './candidate-medical-details-list.component';

describe('CandidateMedicalDetailsListComponent', () => {
  let component: CandidateMedicalDetailsListComponent;
  let fixture: ComponentFixture<CandidateMedicalDetailsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateMedicalDetailsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateMedicalDetailsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
