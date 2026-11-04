import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentDetailsListComponent } from './rent-details-list.component';

describe('RentDetailsListComponent', () => {
  let component: RentDetailsListComponent;
  let fixture: ComponentFixture<RentDetailsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentDetailsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RentDetailsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
