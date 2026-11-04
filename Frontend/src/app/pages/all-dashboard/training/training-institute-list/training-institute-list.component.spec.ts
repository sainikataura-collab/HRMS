import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingInstituteListComponent } from './training-institute-list.component';

describe('TrainingInstituteListComponent', () => {
  let component: TrainingInstituteListComponent;
  let fixture: ComponentFixture<TrainingInstituteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingInstituteListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingInstituteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
