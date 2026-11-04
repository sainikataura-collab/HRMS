import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpTrainingDashComponent } from './emp-training-dash.component';

describe('EmpTrainingDashComponent', () => {
  let component: EmpTrainingDashComponent;
  let fixture: ComponentFixture<EmpTrainingDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpTrainingDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpTrainingDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
