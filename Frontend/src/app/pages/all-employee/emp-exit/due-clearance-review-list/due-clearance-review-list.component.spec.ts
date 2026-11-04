import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DueClearanceReviewListComponent } from './due-clearance-review-list.component';

describe('DueClearanceReviewListComponent', () => {
  let component: DueClearanceReviewListComponent;
  let fixture: ComponentFixture<DueClearanceReviewListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DueClearanceReviewListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DueClearanceReviewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
