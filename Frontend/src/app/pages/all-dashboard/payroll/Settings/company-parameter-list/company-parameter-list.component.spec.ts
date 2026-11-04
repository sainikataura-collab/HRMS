import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyParameterListComponent } from './company-parameter-list.component';

describe('CompanyParameterListComponent', () => {
  let component: CompanyParameterListComponent;
  let fixture: ComponentFixture<CompanyParameterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyParameterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyParameterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
