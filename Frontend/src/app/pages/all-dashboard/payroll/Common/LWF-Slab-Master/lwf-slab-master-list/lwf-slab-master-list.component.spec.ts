import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LwfSlabMasterListComponent } from './lwf-slab-master-list.component';

describe('LwfSlabMasterListComponent', () => {
  let component: LwfSlabMasterListComponent;
  let fixture: ComponentFixture<LwfSlabMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LwfSlabMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LwfSlabMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
