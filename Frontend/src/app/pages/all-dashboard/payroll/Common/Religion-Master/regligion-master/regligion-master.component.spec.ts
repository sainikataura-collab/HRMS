import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegligionMasterComponent } from './regligion-master.component';

describe('RegligionMasterComponent', () => {
  let component: RegligionMasterComponent;
  let fixture: ComponentFixture<RegligionMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegligionMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegligionMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
