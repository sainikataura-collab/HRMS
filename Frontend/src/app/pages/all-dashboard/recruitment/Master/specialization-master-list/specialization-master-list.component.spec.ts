import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecializationMasterListComponent } from './specialization-master-list.component';

describe('SpecializationMasterListComponent', () => {
  let component: SpecializationMasterListComponent;
  let fixture: ComponentFixture<SpecializationMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecializationMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecializationMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
