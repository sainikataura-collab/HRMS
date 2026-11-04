import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutletMasterComponent } from './outlet-master.component';

describe('OutletMasterComponent', () => {
  let component: OutletMasterComponent;
  let fixture: ComponentFixture<OutletMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutletMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutletMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
