import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCompanyComponent } from './all-company.component';

describe('AllCompanyComponent', () => {
  let component: AllCompanyComponent;
  let fixture: ComponentFixture<AllCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCompanyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
