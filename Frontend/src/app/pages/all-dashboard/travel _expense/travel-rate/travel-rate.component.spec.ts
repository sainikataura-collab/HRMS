import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelRateComponent } from './travel-rate.component';

describe('TravelRateComponent', () => {
  let component: TravelRateComponent;
  let fixture: ComponentFixture<TravelRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelRateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
