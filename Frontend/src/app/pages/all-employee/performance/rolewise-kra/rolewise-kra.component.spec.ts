import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolewiseKraComponent } from './rolewise-kra.component';

describe('RolewiseKraComponent', () => {
  let component: RolewiseKraComponent;
  let fixture: ComponentFixture<RolewiseKraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolewiseKraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolewiseKraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
