import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoterVerificationComponent } from './voter-verification.component';

describe('VoterVerificationComponent', () => {
  let component: VoterVerificationComponent;
  let fixture: ComponentFixture<VoterVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoterVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoterVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
