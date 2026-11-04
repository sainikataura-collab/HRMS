import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtcDetailsComponent } from './ctc-details.component';

describe('CtcDetailsComponent', () => {
  let component: CtcDetailsComponent;
  let fixture: ComponentFixture<CtcDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtcDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtcDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
