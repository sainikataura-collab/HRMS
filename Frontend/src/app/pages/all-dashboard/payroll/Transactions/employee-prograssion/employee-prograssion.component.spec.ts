import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePrograssionComponent } from './employee-prograssion.component';

describe('EmployeePrograssionComponent', () => {
  let component: EmployeePrograssionComponent;
  let fixture: ComponentFixture<EmployeePrograssionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeePrograssionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePrograssionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
