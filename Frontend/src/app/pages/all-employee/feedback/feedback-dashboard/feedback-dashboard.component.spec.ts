import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackDashboardComponent } from './feedback-dashboard.component';

describe('FeedbackDashboardComponent', () => {
  let component: FeedbackDashboardComponent;
  let fixture: ComponentFixture<FeedbackDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
