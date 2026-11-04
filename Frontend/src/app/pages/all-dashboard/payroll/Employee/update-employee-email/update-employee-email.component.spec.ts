import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEmployeeEmailComponent } from './update-employee-email.component';

describe('UpdateEmployeeEmailComponent', () => {
  let component: UpdateEmployeeEmailComponent;
  let fixture: ComponentFixture<UpdateEmployeeEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateEmployeeEmailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateEmployeeEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
