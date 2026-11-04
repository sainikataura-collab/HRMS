import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignationmasterComponent } from './designationmaster.component';

describe('DesignationmasterComponent', () => {
  let component: DesignationmasterComponent;
  let fixture: ComponentFixture<DesignationmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignationmasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignationmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
