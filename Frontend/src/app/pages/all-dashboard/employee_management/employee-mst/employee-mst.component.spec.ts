import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMstComponent } from './employee-mst.component';

describe('EmployeeMstComponent', () => {
  let component: EmployeeMstComponent;
  let fixture: ComponentFixture<EmployeeMstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeMstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeMstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
