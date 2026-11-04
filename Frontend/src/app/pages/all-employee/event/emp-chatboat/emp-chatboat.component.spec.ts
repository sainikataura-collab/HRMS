import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpChatboatComponent } from './emp-chatboat.component';

describe('EmpChatboatComponent', () => {
  let component: EmpChatboatComponent;
  let fixture: ComponentFixture<EmpChatboatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpChatboatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpChatboatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
