import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecializationMasterComponent } from './specialization-master.component';

describe('SpecializationMasterComponent', () => {
  let component: SpecializationMasterComponent;
  let fixture: ComponentFixture<SpecializationMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecializationMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecializationMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
