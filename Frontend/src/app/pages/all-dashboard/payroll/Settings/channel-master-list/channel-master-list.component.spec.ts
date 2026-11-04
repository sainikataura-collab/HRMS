import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelMasterListComponent } from './channel-master-list.component';

describe('ChannelMasterListComponent', () => {
  let component: ChannelMasterListComponent;
  let fixture: ComponentFixture<ChannelMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
