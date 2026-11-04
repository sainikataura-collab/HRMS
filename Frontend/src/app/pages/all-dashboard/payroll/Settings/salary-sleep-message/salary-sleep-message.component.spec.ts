import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarySleepMessageComponent } from './salary-sleep-message.component';

describe('SalarySleepMessageComponent', () => {
  let component: SalarySleepMessageComponent;
  let fixture: ComponentFixture<SalarySleepMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalarySleepMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalarySleepMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
