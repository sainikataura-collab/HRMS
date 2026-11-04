import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMasterComponent } from './event-master.component';

describe('EventMasterComponent', () => {
  let component: EventMasterComponent;
  let fixture: ComponentFixture<EventMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
