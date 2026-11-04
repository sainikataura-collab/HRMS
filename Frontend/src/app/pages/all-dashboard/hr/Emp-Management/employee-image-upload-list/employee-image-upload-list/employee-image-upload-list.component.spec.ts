import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeImageUploadListComponent } from './employee-image-upload-list.component';

describe('EmployeeImageUploadListComponent', () => {
  let component: EmployeeImageUploadListComponent;
  let fixture: ComponentFixture<EmployeeImageUploadListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeImageUploadListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeImageUploadListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
