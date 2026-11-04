import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingNeedIdentificationComponent } from './training-need-identification.component';

describe('TrainingNeedIdentificationComponent', () => {
  let component: TrainingNeedIdentificationComponent;
  let fixture: ComponentFixture<TrainingNeedIdentificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingNeedIdentificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingNeedIdentificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
