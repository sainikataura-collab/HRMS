import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountMasterComponent } from './account-master.component';

describe('AccountMasterComponent', () => {
  let component: AccountMasterComponent;
  let fixture: ComponentFixture<AccountMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
