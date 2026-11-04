import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolewiseListComponent } from './rolewise-list.component';

describe('RolewiseListComponent', () => {
  let component: RolewiseListComponent;
  let fixture: ComponentFixture<RolewiseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolewiseListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolewiseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
