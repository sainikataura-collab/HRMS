import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpApproveRegularizationUpdateComponent } from './emp-approve-regularization-update.component';

describe('EmpApproveRegularizationUpdateComponent', () => {
  let component: EmpApproveRegularizationUpdateComponent;
  let fixture: ComponentFixture<EmpApproveRegularizationUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpApproveRegularizationUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpApproveRegularizationUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
