import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingNeedIdentificationListComponent } from './training-need-identification-list.component';

describe('TrainingNeedIdentificationListComponent', () => {
  let component: TrainingNeedIdentificationListComponent;
  let fixture: ComponentFixture<TrainingNeedIdentificationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingNeedIdentificationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingNeedIdentificationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
