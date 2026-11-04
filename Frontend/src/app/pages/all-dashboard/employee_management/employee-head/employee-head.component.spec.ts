import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeHeadComponent } from './employee-head.component';

describe('EmployeeHeadComponent', () => {
  let component: EmployeeHeadComponent;
  let fixture: ComponentFixture<EmployeeHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeHeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
