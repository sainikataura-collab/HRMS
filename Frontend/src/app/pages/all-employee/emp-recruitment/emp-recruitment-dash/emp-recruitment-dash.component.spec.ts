import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpRecruitmentDashComponent } from './emp-recruitment-dash.component';

describe('EmpRecruitmentDashComponent', () => {
  let component: EmpRecruitmentDashComponent;
  let fixture: ComponentFixture<EmpRecruitmentDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpRecruitmentDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpRecruitmentDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
