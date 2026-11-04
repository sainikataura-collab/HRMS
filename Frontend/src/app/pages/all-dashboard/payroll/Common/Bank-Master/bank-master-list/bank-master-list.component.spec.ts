import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankMasterListComponent } from './bank-master-list.component';

describe('BankMasterListComponent', () => {
  let component: BankMasterListComponent;
  let fixture: ComponentFixture<BankMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
