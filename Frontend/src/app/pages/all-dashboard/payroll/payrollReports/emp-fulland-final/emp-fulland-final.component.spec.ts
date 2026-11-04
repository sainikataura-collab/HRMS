import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpFullandFinalComponent } from './emp-fulland-final.component';

describe('EmpFullandFinalComponent', () => {
  let component: EmpFullandFinalComponent;
  let fixture: ComponentFixture<EmpFullandFinalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpFullandFinalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpFullandFinalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
