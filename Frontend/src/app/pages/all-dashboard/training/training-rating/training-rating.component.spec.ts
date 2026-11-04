import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingRatingComponent } from './training-rating.component';

describe('TrainingRatingComponent', () => {
  let component: TrainingRatingComponent;
  let fixture: ComponentFixture<TrainingRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingRatingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
