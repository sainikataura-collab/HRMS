import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCostMasterComponent } from './all-cost-master.component';

describe('AllCostMasterComponent', () => {
  let component: AllCostMasterComponent;
  let fixture: ComponentFixture<AllCostMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCostMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCostMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
