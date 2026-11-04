import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpODRequestComponent } from './emp-od-request.component';

describe('EmpODRequestComponent', () => {
  let component: EmpODRequestComponent;
  let fixture: ComponentFixture<EmpODRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpODRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpODRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
