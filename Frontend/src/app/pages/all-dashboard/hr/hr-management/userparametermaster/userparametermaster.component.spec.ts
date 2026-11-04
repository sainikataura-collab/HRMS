import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserparametermasterComponent } from './userparametermaster.component';

describe('UserparametermasterComponent', () => {
  let component: UserparametermasterComponent;
  let fixture: ComponentFixture<UserparametermasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserparametermasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserparametermasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
