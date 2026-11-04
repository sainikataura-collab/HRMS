import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientBillingDashboardComponent } from './client-billing-dashboard.component';

describe('ClientBillingDashboardComponent', () => {
  let component: ClientBillingDashboardComponent;
  let fixture: ComponentFixture<ClientBillingDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientBillingDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientBillingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
