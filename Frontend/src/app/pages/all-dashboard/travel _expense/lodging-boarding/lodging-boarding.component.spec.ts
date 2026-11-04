import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LodgingBoardingComponent } from './lodging-boarding.component';

describe('LodgingBoardingComponent', () => {
  let component: LodgingBoardingComponent;
  let fixture: ComponentFixture<LodgingBoardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LodgingBoardingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LodgingBoardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
