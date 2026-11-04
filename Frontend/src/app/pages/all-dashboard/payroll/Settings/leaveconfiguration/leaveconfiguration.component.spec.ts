import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveconfigurationComponent } from './leaveconfiguration.component';

describe('LeaveconfigurationComponent', () => {
  let component: LeaveconfigurationComponent;
  let fixture: ComponentFixture<LeaveconfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveconfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveconfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
