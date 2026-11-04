import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpweekoffmasterlistComponent } from './empweekoffmasterlist.component';

describe('EmpweekoffmasterlistComponent', () => {
  let component: EmpweekoffmasterlistComponent;
  let fixture: ComponentFixture<EmpweekoffmasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpweekoffmasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpweekoffmasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
