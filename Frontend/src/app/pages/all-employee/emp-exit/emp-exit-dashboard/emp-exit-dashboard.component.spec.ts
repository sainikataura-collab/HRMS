import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpExitDashboardComponent } from './emp-exit-dashboard.component';

describe('EmpExitDashboardComponent', () => {
  let component: EmpExitDashboardComponent;
  let fixture: ComponentFixture<EmpExitDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpExitDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpExitDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
