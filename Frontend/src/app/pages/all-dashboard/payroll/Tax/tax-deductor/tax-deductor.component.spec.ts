import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxDeductorComponent } from './tax-deductor.component';

describe('TaxDeductorComponent', () => {
  let component: TaxDeductorComponent;
  let fixture: ComponentFixture<TaxDeductorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxDeductorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxDeductorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
