import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubSectionMasterComponent } from './sub-section-master.component';

describe('SubSectionMasterComponent', () => {
  let component: SubSectionMasterComponent;
  let fixture: ComponentFixture<SubSectionMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubSectionMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubSectionMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
