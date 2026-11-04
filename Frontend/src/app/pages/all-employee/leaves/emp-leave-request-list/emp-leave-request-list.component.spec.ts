import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpLeaveRequestListComponent } from './emp-leave-request-list.component';

describe('EmpLeaveRequestListComponent', () => {
  let component: EmpLeaveRequestListComponent;
  let fixture: ComponentFixture<EmpLeaveRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpLeaveRequestListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpLeaveRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
