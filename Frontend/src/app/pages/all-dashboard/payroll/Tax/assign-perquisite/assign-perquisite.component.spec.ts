import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignPerquisiteComponent } from './assign-perquisite.component';

describe('AssignPerquisiteComponent', () => {
  let component: AssignPerquisiteComponent;
  let fixture: ComponentFixture<AssignPerquisiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignPerquisiteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignPerquisiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
