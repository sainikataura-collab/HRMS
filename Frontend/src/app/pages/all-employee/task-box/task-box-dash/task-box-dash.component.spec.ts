import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskBoxDashComponent } from './task-box-dash.component';

describe('TaskBoxDashComponent', () => {
  let component: TaskBoxDashComponent;
  let fixture: ComponentFixture<TaskBoxDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBoxDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskBoxDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
