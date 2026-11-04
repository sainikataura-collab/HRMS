import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailphoneverificationComponent } from './emailphoneverification.component';

describe('EmailphoneverificationComponent', () => {
  let component: EmailphoneverificationComponent;
  let fixture: ComponentFixture<EmailphoneverificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailphoneverificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailphoneverificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
