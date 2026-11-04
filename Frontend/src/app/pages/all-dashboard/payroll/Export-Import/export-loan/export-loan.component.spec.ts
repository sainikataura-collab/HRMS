import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportLoanComponent } from './export-loan.component';

describe('ExportLoanComponent', () => {
  let component: ExportLoanComponent;
  let fixture: ComponentFixture<ExportLoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportLoanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
