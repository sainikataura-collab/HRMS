import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemographiDetailsComponent } from './demographi-details.component';

describe('DemographiDetailsComponent', () => {
  let component: DemographiDetailsComponent;
  let fixture: ComponentFixture<DemographiDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemographiDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemographiDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
