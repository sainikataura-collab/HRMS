import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtcConfigurationComponent } from './ctc-configuration.component';

describe('CtcConfigurationComponent', () => {
  let component: CtcConfigurationComponent;
  let fixture: ComponentFixture<CtcConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtcConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtcConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
