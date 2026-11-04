import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LTAprocessComponent } from './ltaprocess.component';

describe('LTAprocessComponent', () => {
  let component: LTAprocessComponent;
  let fixture: ComponentFixture<LTAprocessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LTAprocessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LTAprocessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
