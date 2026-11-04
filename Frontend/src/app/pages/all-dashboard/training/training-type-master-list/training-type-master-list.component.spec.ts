import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingTypeMasterListComponent } from './training-type-master-list.component';

describe('TrainingTypeMasterListComponent', () => {
  let component: TrainingTypeMasterListComponent;
  let fixture: ComponentFixture<TrainingTypeMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingTypeMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingTypeMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
