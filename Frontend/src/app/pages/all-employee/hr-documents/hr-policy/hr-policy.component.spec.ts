import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrPolicyComponent } from './hr-policy.component';

describe('HrPolicyComponent', () => {
  let component: HrPolicyComponent;
  let fixture: ComponentFixture<HrPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrPolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
