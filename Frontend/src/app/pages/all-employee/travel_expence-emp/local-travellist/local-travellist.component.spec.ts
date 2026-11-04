import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalTravellistComponent } from './local-travellist.component';

describe('LocalTravellistComponent', () => {
  let component: LocalTravellistComponent;
  let fixture: ComponentFixture<LocalTravellistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalTravellistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalTravellistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
