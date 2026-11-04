import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelMasterComponent } from './level-master.component';

describe('LevelMasterComponent', () => {
  let component: LevelMasterComponent;
  let fixture: ComponentFixture<LevelMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LevelMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
