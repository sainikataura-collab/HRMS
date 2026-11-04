import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleMasterComponent } from './role-master.component';

describe('RoleMasterComponent', () => {
  let component: RoleMasterComponent;
  let fixture: ComponentFixture<RoleMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
