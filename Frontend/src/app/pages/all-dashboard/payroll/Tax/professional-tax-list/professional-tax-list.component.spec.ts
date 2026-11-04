import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalTaxListComponent } from './professional-tax-list.component';

describe('ProfessionalTaxListComponent', () => {
  let component: ProfessionalTaxListComponent;
  let fixture: ComponentFixture<ProfessionalTaxListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalTaxListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalTaxListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
