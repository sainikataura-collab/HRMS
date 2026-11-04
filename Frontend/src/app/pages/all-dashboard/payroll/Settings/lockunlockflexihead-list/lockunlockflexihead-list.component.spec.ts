import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockunlockflexiheadListComponent } from './lockunlockflexihead-list.component';

describe('LockunlockflexiheadListComponent', () => {
  let component: LockunlockflexiheadListComponent;
  let fixture: ComponentFixture<LockunlockflexiheadListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LockunlockflexiheadListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LockunlockflexiheadListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
