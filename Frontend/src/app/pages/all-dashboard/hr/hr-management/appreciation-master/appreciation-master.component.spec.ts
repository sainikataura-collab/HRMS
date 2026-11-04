import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppreciationMasterComponent } from './appreciation-master.component';

describe('AppreciationMasterComponent', () => {
  let component: AppreciationMasterComponent;
  let fixture: ComponentFixture<AppreciationMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppreciationMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppreciationMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
