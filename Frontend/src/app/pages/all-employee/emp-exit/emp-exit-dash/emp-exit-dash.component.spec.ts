import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpExitDashComponent } from './emp-exit-dash.component';

describe('EmpExitDashComponent', () => {
  let component: EmpExitDashComponent;
  let fixture: ComponentFixture<EmpExitDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpExitDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpExitDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
