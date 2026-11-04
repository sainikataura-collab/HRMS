import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditTrialComponent } from './audit-trial.component';

describe('AuditTrialComponent', () => {
  let component: AuditTrialComponent;
  let fixture: ComponentFixture<AuditTrialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditTrialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditTrialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
