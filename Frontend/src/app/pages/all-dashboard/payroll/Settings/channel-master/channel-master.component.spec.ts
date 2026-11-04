import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelMasterComponent } from './channel-master.component';

describe('ChannelMasterComponent', () => {
  let component: ChannelMasterComponent;
  let fixture: ComponentFixture<ChannelMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
