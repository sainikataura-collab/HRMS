import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentMasterListComponent } from './department-master-list.component';

describe('DepartmentMasterListComponent', () => {
  let component: DepartmentMasterListComponent;
  let fixture: ComponentFixture<DepartmentMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
