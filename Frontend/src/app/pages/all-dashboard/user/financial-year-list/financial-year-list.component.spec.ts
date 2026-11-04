import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialYearListComponent } from './financial-year-list.component';

describe('FinancialYearListComponent', () => {
  let component: FinancialYearListComponent;
  let fixture: ComponentFixture<FinancialYearListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialYearListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialYearListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
