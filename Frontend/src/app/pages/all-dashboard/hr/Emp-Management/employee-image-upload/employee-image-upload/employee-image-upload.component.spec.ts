import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeImageUploadComponent } from './employee-image-upload.component';

describe('EmployeeImageUploadComponent', () => {
  let component: EmployeeImageUploadComponent;
  let fixture: ComponentFixture<EmployeeImageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeImageUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
