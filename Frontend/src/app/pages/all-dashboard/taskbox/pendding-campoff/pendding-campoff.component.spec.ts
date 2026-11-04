import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenddingCampoffComponent } from './pendding-campoff.component';

describe('PenddingCampoffComponent', () => {
  let component: PenddingCampoffComponent;
  let fixture: ComponentFixture<PenddingCampoffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenddingCampoffComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenddingCampoffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
