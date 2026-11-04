import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreeningApplicationComponent } from './screening-application.component';

describe('ScreeningApplicationComponent', () => {
  let component: ScreeningApplicationComponent;
  let fixture: ComponentFixture<ScreeningApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreeningApplicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreeningApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
