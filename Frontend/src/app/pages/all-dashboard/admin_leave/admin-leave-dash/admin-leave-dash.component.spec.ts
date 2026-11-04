import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLeaveDashComponent } from './admin-leave-dash.component';

describe('AdminLeaveDashComponent', () => {
  let component: AdminLeaveDashComponent;
  let fixture: ComponentFixture<AdminLeaveDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLeaveDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLeaveDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
