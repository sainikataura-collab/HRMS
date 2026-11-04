import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardCandidateViewComponent } from './onboard-candidate-view.component';

describe('OnboardCandidateViewComponent', () => {
  let component: OnboardCandidateViewComponent;
  let fixture: ComponentFixture<OnboardCandidateViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardCandidateViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardCandidateViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
