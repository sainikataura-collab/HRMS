import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBuilder } from './admin-builder';

describe('AdminBuilder', () => {
  let component: AdminBuilder;
  let fixture: ComponentFixture<AdminBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
