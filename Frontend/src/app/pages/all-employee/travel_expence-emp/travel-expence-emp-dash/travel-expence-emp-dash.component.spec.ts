import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelExpenceEmpDashComponent } from './travel-expence-emp-dash.component';

describe('TravelExpenceEmpDashComponent', () => {
  let component: TravelExpenceEmpDashComponent;
  let fixture: ComponentFixture<TravelExpenceEmpDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelExpenceEmpDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelExpenceEmpDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
