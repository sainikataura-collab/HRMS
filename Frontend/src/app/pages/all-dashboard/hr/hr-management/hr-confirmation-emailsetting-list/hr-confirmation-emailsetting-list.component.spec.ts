import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrConfirmationEmailsettingListComponent } from './hr-confirmation-emailsetting-list.component';

describe('HrConfirmationEmailsettingListComponent', () => {
  let component: HrConfirmationEmailsettingListComponent;
  let fixture: ComponentFixture<HrConfirmationEmailsettingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrConfirmationEmailsettingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrConfirmationEmailsettingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
