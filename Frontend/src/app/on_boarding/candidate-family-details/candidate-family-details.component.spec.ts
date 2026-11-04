import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateFamilyDetailsComponent } from './candidate-family-details.component';

describe('CandidateFamilyDetailsComponent', () => {
  let component: CandidateFamilyDetailsComponent;
  let fixture: ComponentFixture<CandidateFamilyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateFamilyDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateFamilyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
