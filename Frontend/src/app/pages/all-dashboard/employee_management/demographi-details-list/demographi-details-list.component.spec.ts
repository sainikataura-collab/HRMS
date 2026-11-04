import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemographiDetailsListComponent } from './demographi-details-list.component';

describe('DemographiDetailsListComponent', () => {
  let component: DemographiDetailsListComponent;
  let fixture: ComponentFixture<DemographiDetailsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemographiDetailsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemographiDetailsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
