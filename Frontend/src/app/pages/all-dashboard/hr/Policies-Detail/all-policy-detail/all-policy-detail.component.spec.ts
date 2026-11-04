import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPolicyDetailComponent } from './all-policy-detail.component';

describe('AllPolicyDetailComponent', () => {
  let component: AllPolicyDetailComponent;
  let fixture: ComponentFixture<AllPolicyDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPolicyDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllPolicyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
