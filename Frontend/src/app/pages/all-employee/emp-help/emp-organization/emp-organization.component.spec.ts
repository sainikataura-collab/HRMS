import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpOrganizationComponent } from './emp-organization.component';

describe('EmpOrganizationComponent', () => {
  let component: EmpOrganizationComponent;
  let fixture: ComponentFixture<EmpOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpOrganizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
