import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraningVideoUrlUploadComponent } from './traning-video-url-upload.component';

describe('TraningVideoUrlUploadComponent', () => {
  let component: TraningVideoUrlUploadComponent;
  let fixture: ComponentFixture<TraningVideoUrlUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraningVideoUrlUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraningVideoUrlUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
