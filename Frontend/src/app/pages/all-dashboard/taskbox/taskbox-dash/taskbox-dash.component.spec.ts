import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskboxDashComponent } from './taskbox-dash.component';

describe('TaskboxDashComponent', () => {
  let component: TaskboxDashComponent;
  let fixture: ComponentFixture<TaskboxDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskboxDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskboxDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
