import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCDOComponent } from './import-cdo.component';

describe('ImportCDOComponent', () => {
  let component: ImportCDOComponent;
  let fixture: ComponentFixture<ImportCDOComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportCDOComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportCDOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
