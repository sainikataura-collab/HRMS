import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubDepartmentMasterComponent } from './sub-department-master.component';

describe('SubDepartmentMasterComponent', () => {
  let component: SubDepartmentMasterComponent;
  let fixture: ComponentFixture<SubDepartmentMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubDepartmentMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubDepartmentMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
