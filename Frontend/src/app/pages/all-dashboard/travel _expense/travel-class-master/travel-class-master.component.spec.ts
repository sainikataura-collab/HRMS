import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelClassMasterComponent } from './travel-class-master.component';

describe('TravelClassMasterComponent', () => {
  let component: TravelClassMasterComponent;
  let fixture: ComponentFixture<TravelClassMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelClassMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelClassMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
