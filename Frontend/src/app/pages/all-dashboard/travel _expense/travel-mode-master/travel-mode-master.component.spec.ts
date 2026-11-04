import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelModeMasterComponent } from './travel-mode-master.component';

describe('TravelModeMasterComponent', () => {
  let component: TravelModeMasterComponent;
  let fixture: ComponentFixture<TravelModeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelModeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelModeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
