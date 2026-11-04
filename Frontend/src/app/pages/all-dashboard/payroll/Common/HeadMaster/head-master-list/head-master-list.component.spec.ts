import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadMasterListComponent } from './head-master-list.component';

describe('HeadMasterListComponent', () => {
  let component: HeadMasterListComponent;
  let fixture: ComponentFixture<HeadMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeadMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
