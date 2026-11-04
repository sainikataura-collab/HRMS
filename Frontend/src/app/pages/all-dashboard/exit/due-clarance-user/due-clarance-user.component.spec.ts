import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DueClaranceUserComponent } from './due-clarance-user.component';

describe('DueClaranceUserComponent', () => {
  let component: DueClaranceUserComponent;
  let fixture: ComponentFixture<DueClaranceUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DueClaranceUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DueClaranceUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
