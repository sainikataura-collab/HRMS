import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeEmployeePasswordComponent } from './change-employee-password.component';

describe('ChangeEmployeePasswordComponent', () => {
  let component: ChangeEmployeePasswordComponent;
  let fixture: ComponentFixture<ChangeEmployeePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeEmployeePasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeEmployeePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
