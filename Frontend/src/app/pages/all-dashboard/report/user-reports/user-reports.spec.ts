import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReports } from './user-reports';

describe('UserReports', () => {
  let component: UserReports;
  let fixture: ComponentFixture<UserReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserReports);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
