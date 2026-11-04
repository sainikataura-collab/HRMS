import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockunlockflexiheadComponent } from './lockunlockflexihead.component';

describe('LockunlockflexiheadComponent', () => {
  let component: LockunlockflexiheadComponent;
  let fixture: ComponentFixture<LockunlockflexiheadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LockunlockflexiheadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LockunlockflexiheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
