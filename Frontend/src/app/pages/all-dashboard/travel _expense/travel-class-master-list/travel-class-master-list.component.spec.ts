import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelClassMasterListComponent } from './travel-class-master-list.component';

describe('TravelClassMasterListComponent', () => {
  let component: TravelClassMasterListComponent;
  let fixture: ComponentFixture<TravelClassMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelClassMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelClassMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
