import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DueClarancUserListComponent } from './due-claranc-user-list.component';

describe('DueClarancUserListComponent', () => {
  let component: DueClarancUserListComponent;
  let fixture: ComponentFixture<DueClarancUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DueClarancUserListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DueClarancUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
