import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrpoliciesDashComponent } from './hrpolicies-dash.component';

describe('HrpoliciesDashComponent', () => {
  let component: HrpoliciesDashComponent;
  let fixture: ComponentFixture<HrpoliciesDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrpoliciesDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrpoliciesDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
