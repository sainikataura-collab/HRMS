import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxDeductorListComponent } from './tax-deductor-list.component';

describe('TaxDeductorListComponent', () => {
  let component: TaxDeductorListComponent;
  let fixture: ComponentFixture<TaxDeductorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxDeductorListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxDeductorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
