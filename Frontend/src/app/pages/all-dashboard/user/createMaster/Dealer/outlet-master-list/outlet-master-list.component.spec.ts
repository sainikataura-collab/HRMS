import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutletMasterListComponent } from './outlet-master-list.component';

describe('OutletMasterListComponent', () => {
  let component: OutletMasterListComponent;
  let fixture: ComponentFixture<OutletMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutletMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutletMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
