import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityMasterListComponent } from './city-master-list.component';

describe('CityMasterListComponent', () => {
  let component: CityMasterListComponent;
  let fixture: ComponentFixture<CityMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CityMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
