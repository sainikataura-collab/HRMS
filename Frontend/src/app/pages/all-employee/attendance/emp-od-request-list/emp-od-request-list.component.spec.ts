import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpODRequestListComponent } from './emp-od-request-list.component';

describe('EmpODRequestListComponent', () => {
  let component: EmpODRequestListComponent;
  let fixture: ComponentFixture<EmpODRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpODRequestListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpODRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
