import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualIncomeTaxComponent } from './manual-income-tax.component';

describe('ManualIncomeTaxComponent', () => {
  let component: ManualIncomeTaxComponent;
  let fixture: ComponentFixture<ManualIncomeTaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualIncomeTaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualIncomeTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
