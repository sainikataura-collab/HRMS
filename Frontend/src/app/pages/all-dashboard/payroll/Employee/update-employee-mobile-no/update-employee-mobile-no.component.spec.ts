import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEmployeeMobileNoComponent } from './update-employee-mobile-no.component';

describe('UpdateEmployeeMobileNoComponent', () => {
  let component: UpdateEmployeeMobileNoComponent;
  let fixture: ComponentFixture<UpdateEmployeeMobileNoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateEmployeeMobileNoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateEmployeeMobileNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
