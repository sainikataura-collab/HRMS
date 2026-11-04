import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingDayMasterComponent } from './working-day-master.component';

describe('WorkingDayMasterComponent', () => {
  let component: WorkingDayMasterComponent;
  let fixture: ComponentFixture<WorkingDayMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkingDayMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkingDayMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
