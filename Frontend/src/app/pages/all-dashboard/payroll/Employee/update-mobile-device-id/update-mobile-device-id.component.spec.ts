import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMobileDeviceIdComponent } from './update-mobile-device-id.component';

describe('UpdateMobileDeviceIdComponent', () => {
  let component: UpdateMobileDeviceIdComponent;
  let fixture: ComponentFixture<UpdateMobileDeviceIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateMobileDeviceIdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateMobileDeviceIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
