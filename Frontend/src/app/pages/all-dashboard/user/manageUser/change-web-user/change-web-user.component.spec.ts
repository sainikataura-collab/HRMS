import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeWebUserComponent } from './change-web-user.component';

describe('ChangeWebUserComponent', () => {
  let component: ChangeWebUserComponent;
  let fixture: ComponentFixture<ChangeWebUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeWebUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeWebUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
