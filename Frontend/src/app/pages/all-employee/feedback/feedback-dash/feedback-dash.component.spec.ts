import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackDashComponent } from './feedback-dash.component';

describe('FeedbackDashComponent', () => {
  let component: FeedbackDashComponent;
  let fixture: ComponentFixture<FeedbackDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
