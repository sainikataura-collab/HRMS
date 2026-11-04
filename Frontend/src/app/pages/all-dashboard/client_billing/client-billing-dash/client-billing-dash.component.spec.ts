import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientBillingDashComponent } from './client-billing-dash.component';

describe('ClientBillingDashComponent', () => {
  let component: ClientBillingDashComponent;
  let fixture: ComponentFixture<ClientBillingDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientBillingDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientBillingDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
