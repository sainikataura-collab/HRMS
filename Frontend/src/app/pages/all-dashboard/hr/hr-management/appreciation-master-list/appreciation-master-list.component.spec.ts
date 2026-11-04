import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppreciationMasterListComponent } from './appreciation-master-list.component';

describe('AppreciationMasterListComponent', () => {
  let component: AppreciationMasterListComponent;
  let fixture: ComponentFixture<AppreciationMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppreciationMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppreciationMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
