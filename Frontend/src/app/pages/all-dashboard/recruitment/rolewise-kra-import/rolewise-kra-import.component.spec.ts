import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolewiseKraImportComponent } from './rolewise-kra-import.component';

describe('RolewiseKraImportComponent', () => {
  let component: RolewiseKraImportComponent;
  let fixture: ComponentFixture<RolewiseKraImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolewiseKraImportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolewiseKraImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
