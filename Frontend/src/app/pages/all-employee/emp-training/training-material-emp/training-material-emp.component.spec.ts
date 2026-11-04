import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingMaterialEmpComponent } from './training-material-emp.component';

describe('TrainingMaterialEmpComponent', () => {
  let component: TrainingMaterialEmpComponent;
  let fixture: ComponentFixture<TrainingMaterialEmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingMaterialEmpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingMaterialEmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
