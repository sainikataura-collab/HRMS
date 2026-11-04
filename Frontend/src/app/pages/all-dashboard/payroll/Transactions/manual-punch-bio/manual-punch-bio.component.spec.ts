import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualPunchBioComponent } from './manual-punch-bio.component';

describe('ManualPunchBioComponent', () => {
  let component: ManualPunchBioComponent;
  let fixture: ComponentFixture<ManualPunchBioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualPunchBioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualPunchBioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
