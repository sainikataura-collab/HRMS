import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HREmployeeQualificationMstComponent } from './hr-employee-qualification-mst.component';

describe('HREmployeeQualificationMstComponent', () => {
  let component: HREmployeeQualificationMstComponent;
  let fixture: ComponentFixture<HREmployeeQualificationMstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HREmployeeQualificationMstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HREmployeeQualificationMstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
