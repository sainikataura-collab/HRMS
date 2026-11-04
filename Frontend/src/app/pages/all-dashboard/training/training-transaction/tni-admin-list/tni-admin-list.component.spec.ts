import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TniAdminListComponent } from './tni-admin-list.component';

describe('TniAdminListComponent', () => {
  let component: TniAdminListComponent;
  let fixture: ComponentFixture<TniAdminListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TniAdminListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TniAdminListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
