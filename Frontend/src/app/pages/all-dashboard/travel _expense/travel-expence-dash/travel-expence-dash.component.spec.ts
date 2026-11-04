import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelExpenceDashComponent } from './travel-expence-dash.component';

describe('TravelExpenceDashComponent', () => {
  let component: TravelExpenceDashComponent;
  let fixture: ComponentFixture<TravelExpenceDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelExpenceDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelExpenceDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
