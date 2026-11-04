import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMasterListComponent } from './event-master-list.component';

describe('EventMasterListComponent', () => {
  let component: EventMasterListComponent;
  let fixture: ComponentFixture<EventMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
