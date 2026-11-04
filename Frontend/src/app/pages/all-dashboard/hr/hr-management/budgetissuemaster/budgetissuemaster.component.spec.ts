import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetissuemasterComponent } from './budgetissuemaster.component';

describe('BudgetissuemasterComponent', () => {
  let component: BudgetissuemasterComponent;
  let fixture: ComponentFixture<BudgetissuemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetissuemasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetissuemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
