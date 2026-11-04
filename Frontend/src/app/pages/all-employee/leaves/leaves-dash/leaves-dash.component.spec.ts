import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavesDashComponent } from './leaves-dash.component';

describe('LeavesDashComponent', () => {
  let component: LeavesDashComponent;
  let fixture: ComponentFixture<LeavesDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeavesDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeavesDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
