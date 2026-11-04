import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxFlexibillAprovalComponent } from './tax-flexibill-aproval.component';

describe('TaxFlexibillAprovalComponent', () => {
  let component: TaxFlexibillAprovalComponent;
  let fixture: ComponentFixture<TaxFlexibillAprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxFlexibillAprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxFlexibillAprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
