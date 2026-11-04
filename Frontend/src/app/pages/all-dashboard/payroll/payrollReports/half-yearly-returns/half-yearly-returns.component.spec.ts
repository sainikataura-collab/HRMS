import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HalfYearlyReturnsComponent } from './half-yearly-returns.component';

describe('HalfYearlyReturnsComponent', () => {
  let component: HalfYearlyReturnsComponent;
  let fixture: ComponentFixture<HalfYearlyReturnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HalfYearlyReturnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HalfYearlyReturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
