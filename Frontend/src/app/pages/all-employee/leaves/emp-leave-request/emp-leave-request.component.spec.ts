import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpLeaveRequestComponent } from './emp-leave-request.component';

describe('EmpLeaveRequestComponent', () => {
  let component: EmpLeaveRequestComponent;
  let fixture: ComponentFixture<EmpLeaveRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpLeaveRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpLeaveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
