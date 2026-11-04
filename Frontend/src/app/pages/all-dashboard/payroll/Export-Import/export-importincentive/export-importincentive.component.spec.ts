import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportImportincentiveComponent } from './export-importincentive.component';

describe('ExportImportincentiveComponent', () => {
  let component: ExportImportincentiveComponent;
  let fixture: ComponentFixture<ExportImportincentiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportImportincentiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportImportincentiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
