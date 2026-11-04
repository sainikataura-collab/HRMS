import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingLeaveODComponent } from './pending-leave-od.component';

describe('PendingLeaveODComponent', () => {
  let component: PendingLeaveODComponent;
  let fixture: ComponentFixture<PendingLeaveODComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingLeaveODComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingLeaveODComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
