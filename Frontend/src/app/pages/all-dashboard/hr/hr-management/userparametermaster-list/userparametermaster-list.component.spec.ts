import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserparametermasterListComponent } from './userparametermaster-list.component';

describe('UserparametermasterListComponent', () => {
  let component: UserparametermasterListComponent;
  let fixture: ComponentFixture<UserparametermasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserparametermasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserparametermasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
