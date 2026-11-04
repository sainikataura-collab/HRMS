import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraningCalendarAdminListComponent } from './traning-calendar-admin-list.component';

describe('TraningCalendarAdminListComponent', () => {
  let component: TraningCalendarAdminListComponent;
  let fixture: ComponentFixture<TraningCalendarAdminListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraningCalendarAdminListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraningCalendarAdminListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
