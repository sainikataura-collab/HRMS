import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalTaxComponent } from './professional-tax.component';

describe('ProfessionalTaxComponent', () => {
  let component: ProfessionalTaxComponent;
  let fixture: ComponentFixture<ProfessionalTaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalTaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
