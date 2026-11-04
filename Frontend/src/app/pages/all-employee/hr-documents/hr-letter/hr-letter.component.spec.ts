import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrLetterComponent } from './hr-letter.component';

describe('HrLetterComponent', () => {
  let component: HrLetterComponent;
  let fixture: ComponentFixture<HrLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
