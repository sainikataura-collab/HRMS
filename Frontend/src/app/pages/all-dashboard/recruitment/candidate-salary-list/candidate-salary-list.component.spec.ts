import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateSalaryListComponent } from './candidate-salary-list.component';

describe('CandidateSalaryListComponent', () => {
  let component: CandidateSalaryListComponent;
  let fixture: ComponentFixture<CandidateSalaryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateSalaryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateSalaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
