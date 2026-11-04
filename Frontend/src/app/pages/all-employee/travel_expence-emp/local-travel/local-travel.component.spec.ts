import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalTravelComponent } from './local-travel.component';

describe('LocalTravelComponent', () => {
  let component: LocalTravelComponent;
  let fixture: ComponentFixture<LocalTravelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalTravelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalTravelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
