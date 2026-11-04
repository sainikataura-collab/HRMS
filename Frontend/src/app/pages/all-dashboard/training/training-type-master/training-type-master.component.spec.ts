import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingTypeMasterComponent } from './training-type-master.component';

describe('TrainingTypeMasterComponent', () => {
  let component: TrainingTypeMasterComponent;
  let fixture: ComponentFixture<TrainingTypeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingTypeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
