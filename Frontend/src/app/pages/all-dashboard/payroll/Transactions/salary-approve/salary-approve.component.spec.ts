import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryApproveComponent } from './salary-approve.component';

describe('SalaryApproveComponent', () => {
  let component: SalaryApproveComponent;
  let fixture: ComponentFixture<SalaryApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryApproveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
