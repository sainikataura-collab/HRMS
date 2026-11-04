import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatboatComponent } from './chatboat.component';

describe('ChatboatComponent', () => {
  let component: ChatboatComponent;
  let fixture: ComponentFixture<ChatboatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatboatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatboatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
