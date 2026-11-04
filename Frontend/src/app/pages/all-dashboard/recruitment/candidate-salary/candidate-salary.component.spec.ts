import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateSalaryComponent } from './candidate-salary.component';

describe('CandidateSalaryComponent', () => {
  let component: CandidateSalaryComponent;
  let fixture: ComponentFixture<CandidateSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateSalaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
