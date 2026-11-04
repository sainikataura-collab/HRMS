import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpHodViewComponent } from './emp-hod-view.component';

describe('EmpHodViewComponent', () => {
  let component: EmpHodViewComponent;
  let fixture: ComponentFixture<EmpHodViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpHodViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpHodViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
