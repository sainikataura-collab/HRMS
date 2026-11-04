import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrConfirmationEmailsettingComponent } from './hr-confirmation-emailsetting.component';

describe('HrConfirmationEmailsettingComponent', () => {
  let component: HrConfirmationEmailsettingComponent;
  let fixture: ComponentFixture<HrConfirmationEmailsettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrConfirmationEmailsettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrConfirmationEmailsettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
