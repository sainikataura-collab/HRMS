import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingMeterialComponent } from './training-meterial.component';

describe('TrainingMeterialComponent', () => {
  let component: TrainingMeterialComponent;
  let fixture: ComponentFixture<TrainingMeterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingMeterialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingMeterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
