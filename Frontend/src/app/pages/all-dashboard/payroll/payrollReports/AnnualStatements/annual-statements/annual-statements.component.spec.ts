import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualStatementsComponent } from './annual-statements.component';

describe('AnnualStatementsComponent', () => {
  let component: AnnualStatementsComponent;
  let fixture: ComponentFixture<AnnualStatementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnualStatementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnualStatementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
