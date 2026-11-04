import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskboxDashboardComponent } from './taskbox-dashboard.component';

describe('TaskboxDashboardComponent', () => {
  let component: TaskboxDashboardComponent;
  let fixture: ComponentFixture<TaskboxDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskboxDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskboxDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
