import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoSalaryProcessComponent } from './auto-salary-process.component';

describe('AutoSalaryProcessComponent', () => {
  let component: AutoSalaryProcessComponent;
  let fixture: ComponentFixture<AutoSalaryProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoSalaryProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoSalaryProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
