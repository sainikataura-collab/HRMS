import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelModeMasterListComponent } from './travel-mode-master-list.component';

describe('TravelModeMasterListComponent', () => {
  let component: TravelModeMasterListComponent;
  let fixture: ComponentFixture<TravelModeMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelModeMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelModeMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
