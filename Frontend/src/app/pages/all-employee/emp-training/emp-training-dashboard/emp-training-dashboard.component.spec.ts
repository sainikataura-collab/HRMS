import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpTrainingDashboardComponent } from './emp-training-dashboard.component';

describe('EmpTrainingDashboardComponent', () => {
  let component: EmpTrainingDashboardComponent;
  let fixture: ComponentFixture<EmpTrainingDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpTrainingDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpTrainingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
