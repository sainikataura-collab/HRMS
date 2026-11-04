import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReimdocStatusListComponent } from './reimdoc-status-list.component';

describe('ReimdocStatusListComponent', () => {
  let component: ReimdocStatusListComponent;
  let fixture: ComponentFixture<ReimdocStatusListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReimdocStatusListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReimdocStatusListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
