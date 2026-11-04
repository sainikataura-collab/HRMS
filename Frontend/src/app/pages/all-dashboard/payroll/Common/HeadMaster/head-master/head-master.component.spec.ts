import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadMasterComponent } from './head-master.component';

describe('HeadMasterComponent', () => {
  let component: HeadMasterComponent;
  let fixture: ComponentFixture<HeadMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeadMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
