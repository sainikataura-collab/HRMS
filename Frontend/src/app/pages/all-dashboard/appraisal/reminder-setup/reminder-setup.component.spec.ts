import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderSetupComponent } from './reminder-setup.component';

describe('ReminderSetupComponent', () => {
  let component: ReminderSetupComponent;
  let fixture: ComponentFixture<ReminderSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReminderSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReminderSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
