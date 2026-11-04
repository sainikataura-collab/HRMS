import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationMasterListComponent } from './location-master-list.component';

describe('LocationMasterListComponent', () => {
  let component: LocationMasterListComponent;
  let fixture: ComponentFixture<LocationMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
