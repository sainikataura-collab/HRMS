import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrChatboatComponent } from './hr-chatboat.component';

describe('HrChatboatComponent', () => {
  let component: HrChatboatComponent;
  let fixture: ComponentFixture<HrChatboatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrChatboatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrChatboatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
