import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingInstituteComponent } from './training-institute.component';

describe('TrainingInstituteComponent', () => {
  let component: TrainingInstituteComponent;
  let fixture: ComponentFixture<TrainingInstituteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingInstituteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingInstituteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
