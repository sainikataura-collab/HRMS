import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubDepartmentListComponent } from './sub-department-list.component';

describe('SubDepartmentListComponent', () => {
  let component: SubDepartmentListComponent;
  let fixture: ComponentFixture<SubDepartmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubDepartmentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubDepartmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
