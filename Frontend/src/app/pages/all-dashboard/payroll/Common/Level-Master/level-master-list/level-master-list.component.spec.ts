import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelMasterListComponent } from './level-master-list.component';

describe('LevelMasterListComponent', () => {
  let component: LevelMasterListComponent;
  let fixture: ComponentFixture<LevelMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LevelMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
