import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegligionMasterListComponent } from './regligion-master-list.component';

describe('RegligionMasterListComponent', () => {
  let component: RegligionMasterListComponent;
  let fixture: ComponentFixture<RegligionMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegligionMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegligionMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
