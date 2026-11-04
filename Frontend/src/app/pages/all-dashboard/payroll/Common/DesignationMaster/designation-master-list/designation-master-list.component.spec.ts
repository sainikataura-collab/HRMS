import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignationMasterListComponent } from './designation-master-list.component';

describe('DesignationMasterListComponent', () => {
  let component: DesignationMasterListComponent;
  let fixture: ComponentFixture<DesignationMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignationMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignationMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
