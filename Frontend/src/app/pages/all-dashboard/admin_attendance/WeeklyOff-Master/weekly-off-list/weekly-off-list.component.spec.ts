import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyOffListComponent } from './weekly-off-list.component';

describe('WeeklyOffListComponent', () => {
  let component: WeeklyOffListComponent;
  let fixture: ComponentFixture<WeeklyOffListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyOffListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyOffListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
