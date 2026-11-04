import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelRateListComponent } from './travel-rate-list.component';

describe('TravelRateListComponent', () => {
  let component: TravelRateListComponent;
  let fixture: ComponentFixture<TravelRateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelRateListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelRateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
