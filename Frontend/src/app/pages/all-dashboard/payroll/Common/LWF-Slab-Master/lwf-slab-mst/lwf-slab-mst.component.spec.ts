import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LwfSlabMstComponent } from './lwf-slab-mst.component';

describe('LwfSlabMstComponent', () => {
  let component: LwfSlabMstComponent;
  let fixture: ComponentFixture<LwfSlabMstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LwfSlabMstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LwfSlabMstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
