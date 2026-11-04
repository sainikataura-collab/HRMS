import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraningVideoUrlUploadListComponent } from './traning-video-url-upload-list.component';

describe('TraningVideoUrlUploadListComponent', () => {
  let component: TraningVideoUrlUploadListComponent;
  let fixture: ComponentFixture<TraningVideoUrlUploadListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraningVideoUrlUploadListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraningVideoUrlUploadListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
