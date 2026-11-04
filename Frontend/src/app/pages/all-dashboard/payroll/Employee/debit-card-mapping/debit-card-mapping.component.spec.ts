import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebitCardMappingComponent } from './debit-card-mapping.component';

describe('DebitCardMappingComponent', () => {
  let component: DebitCardMappingComponent;
  let fixture: ComponentFixture<DebitCardMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebitCardMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebitCardMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
