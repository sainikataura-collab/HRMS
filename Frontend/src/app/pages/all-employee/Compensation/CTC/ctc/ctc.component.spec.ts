import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CTCComponent } from './ctc.component';

describe('CTCComponent', () => {
  let component: CTCComponent;
  let fixture: ComponentFixture<CTCComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CTCComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CTCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
