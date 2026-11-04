import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetissuemasterListComponent } from './budgetissuemaster-list.component';

describe('BudgetissuemasterListComponent', () => {
  let component: BudgetissuemasterListComponent;
  let fixture: ComponentFixture<BudgetissuemasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetissuemasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetissuemasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
