import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayStoppedSalaryComponent } from './pay-stopped-salary.component';

describe('PayStoppedSalaryComponent', () => {
  let component: PayStoppedSalaryComponent;
  let fixture: ComponentFixture<PayStoppedSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayStoppedSalaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayStoppedSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
