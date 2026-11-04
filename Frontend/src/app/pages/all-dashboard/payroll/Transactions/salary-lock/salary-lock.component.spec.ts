import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryLockComponent } from './salary-lock.component';

describe('SalaryLockComponent', () => {
  let component: SalaryLockComponent;
  let fixture: ComponentFixture<SalaryLockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryLockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryLockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
