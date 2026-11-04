import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavesDashbardComponent } from './leaves-dashbard.component';

describe('LeavesDashbardComponent', () => {
  let component: LeavesDashbardComponent;
  let fixture: ComponentFixture<LeavesDashbardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeavesDashbardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeavesDashbardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
