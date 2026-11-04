import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekOffComponent } from './week-off.component';

describe('WeekOffComponent', () => {
  let component: WeekOffComponent;
  let fixture: ComponentFixture<WeekOffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekOffComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeekOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
