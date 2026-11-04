import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpApproveRegularizationComponent } from './emp-approve-regularization.component';

describe('EmpApproveRegularizationComponent', () => {
  let component: EmpApproveRegularizationComponent;
  let fixture: ComponentFixture<EmpApproveRegularizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpApproveRegularizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpApproveRegularizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
