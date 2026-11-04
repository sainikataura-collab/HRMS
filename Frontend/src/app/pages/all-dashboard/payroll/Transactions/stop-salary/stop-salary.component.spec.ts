import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopSalaryComponent } from './stop-salary.component';

describe('StopSalaryComponent', () => {
  let component: StopSalaryComponent;
  let fixture: ComponentFixture<StopSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopSalaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StopSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
