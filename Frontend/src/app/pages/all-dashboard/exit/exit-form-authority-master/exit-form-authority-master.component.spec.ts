import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitFormAuthorityMasterComponent } from './exit-form-authority-master.component';

describe('ExitFormAuthorityMasterComponent', () => {
  let component: ExitFormAuthorityMasterComponent;
  let fixture: ComponentFixture<ExitFormAuthorityMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExitFormAuthorityMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExitFormAuthorityMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
