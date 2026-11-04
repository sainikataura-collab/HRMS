import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolewiseKraReportComponent } from './rolewise-kra-report.component';

describe('RolewiseKraReportComponent', () => {
  let component: RolewiseKraReportComponent;
  let fixture: ComponentFixture<RolewiseKraReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolewiseKraReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolewiseKraReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
