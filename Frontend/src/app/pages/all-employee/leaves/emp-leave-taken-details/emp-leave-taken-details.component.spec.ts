import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpLeaveTakenDetailsComponent } from './emp-leave-taken-details.component';

describe('EmpLeaveTakenDetailsComponent', () => {
  let component: EmpLeaveTakenDetailsComponent;
  let fixture: ComponentFixture<EmpLeaveTakenDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpLeaveTakenDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpLeaveTakenDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
