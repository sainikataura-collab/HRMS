import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EMailConfigrationSettingsComponent } from './e-mail-configration-settings.component';

describe('EMailConfigrationSettingsComponent', () => {
  let component: EMailConfigrationSettingsComponent;
  let fixture: ComponentFixture<EMailConfigrationSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EMailConfigrationSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EMailConfigrationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
