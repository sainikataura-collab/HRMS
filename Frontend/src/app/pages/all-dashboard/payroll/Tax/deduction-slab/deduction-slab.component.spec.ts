import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeductionSlabComponent } from './deduction-slab.component';

describe('DeductionSlabComponent', () => {
  let component: DeductionSlabComponent;
  let fixture: ComponentFixture<DeductionSlabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeductionSlabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeductionSlabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
