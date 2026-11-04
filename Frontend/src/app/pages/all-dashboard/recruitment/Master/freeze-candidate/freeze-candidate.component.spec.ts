import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreezeCandidateComponent } from './freeze-candidate.component';

describe('FreezeCandidateComponent', () => {
  let component: FreezeCandidateComponent;
  let fixture: ComponentFixture<FreezeCandidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreezeCandidateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreezeCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
