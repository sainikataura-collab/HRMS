import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignPerquisiteListComponent } from './assign-perquisite-list.component';

describe('AssignPerquisiteListComponent', () => {
  let component: AssignPerquisiteListComponent;
  let fixture: ComponentFixture<AssignPerquisiteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignPerquisiteListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignPerquisiteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
