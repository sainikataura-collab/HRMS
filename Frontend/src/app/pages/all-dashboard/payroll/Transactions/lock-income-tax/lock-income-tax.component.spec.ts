import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockIncomeTaxComponent } from './lock-income-tax.component';

describe('LockIncomeTaxComponent', () => {
  let component: LockIncomeTaxComponent;
  let fixture: ComponentFixture<LockIncomeTaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LockIncomeTaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LockIncomeTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
