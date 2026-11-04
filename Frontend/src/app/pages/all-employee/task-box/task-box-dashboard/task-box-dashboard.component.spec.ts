import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskBoxDashboardComponent } from './task-box-dashboard.component';

describe('TaskBoxDashboardComponent', () => {
  let component: TaskBoxDashboardComponent;
  let fixture: ComponentFixture<TaskBoxDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBoxDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskBoxDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
