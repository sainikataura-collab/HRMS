import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateRefDetailsListComponent } from './candidate-ref-details-list.component';

describe('CandidateRefDetailsListComponent', () => {
  let component: CandidateRefDetailsListComponent;
  let fixture: ComponentFixture<CandidateRefDetailsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateRefDetailsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateRefDetailsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
