import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateRefDetailsComponent } from './candidate-ref-details.component';

describe('CandidateRefDetailsComponent', () => {
  let component: CandidateRefDetailsComponent;
  let fixture: ComponentFixture<CandidateRefDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateRefDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateRefDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
