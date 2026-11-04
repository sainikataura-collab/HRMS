import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardCandidatelistComponent } from './onboard-candidatelist.component';

describe('OnboardCandidatelistComponent', () => {
  let component: OnboardCandidatelistComponent;
  let fixture: ComponentFixture<OnboardCandidatelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardCandidatelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardCandidatelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
