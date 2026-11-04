import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllQuarterComponent } from './all-quarter.component';

describe('AllQuarterComponent', () => {
  let component: AllQuarterComponent;
  let fixture: ComponentFixture<AllQuarterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllQuarterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllQuarterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
