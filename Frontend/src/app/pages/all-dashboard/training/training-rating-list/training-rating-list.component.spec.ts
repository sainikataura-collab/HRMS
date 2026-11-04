import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingRatingListComponent } from './training-rating-list.component';

describe('TrainingRatingListComponent', () => {
  let component: TrainingRatingListComponent;
  let fixture: ComponentFixture<TrainingRatingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingRatingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingRatingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
