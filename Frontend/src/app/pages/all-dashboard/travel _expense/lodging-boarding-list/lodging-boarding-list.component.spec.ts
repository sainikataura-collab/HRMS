import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LodgingBoardingListComponent } from './lodging-boarding-list.component';

describe('LodgingBoardingListComponent', () => {
  let component: LodgingBoardingListComponent;
  let fixture: ComponentFixture<LodgingBoardingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LodgingBoardingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LodgingBoardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
