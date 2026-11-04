import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLeaveDashboardComponent } from './admin-leave-dashboard.component';

describe('AdminLeaveDashboardComponent', () => {
  let component: AdminLeaveDashboardComponent;
  let fixture: ComponentFixture<AdminLeaveDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLeaveDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLeaveDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
