import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentiveProcessComponent } from './incentive-process.component';

describe('IncentiveProcessComponent', () => {
  let component: IncentiveProcessComponent;
  let fixture: ComponentFixture<IncentiveProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncentiveProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncentiveProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
