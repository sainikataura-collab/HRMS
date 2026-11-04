import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DueClearanceReviewFormComponent } from './due-clearance-review-form.component';

describe('DueClearanceReviewFormComponent', () => {
  let component: DueClearanceReviewFormComponent;
  let fixture: ComponentFixture<DueClearanceReviewFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DueClearanceReviewFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DueClearanceReviewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
