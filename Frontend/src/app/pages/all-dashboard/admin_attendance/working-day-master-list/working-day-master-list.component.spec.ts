import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingDayMasterListComponent } from './working-day-master-list.component';

describe('WorkingDayMasterListComponent', () => {
  let component: WorkingDayMasterListComponent;
  let fixture: ComponentFixture<WorkingDayMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkingDayMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkingDayMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
