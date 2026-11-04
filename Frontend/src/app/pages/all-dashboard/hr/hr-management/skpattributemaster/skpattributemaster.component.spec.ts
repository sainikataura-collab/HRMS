import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SKPattributemasterComponent } from './skpattributemaster.component';

describe('SKPattributemasterComponent', () => {
  let component: SKPattributemasterComponent;
  let fixture: ComponentFixture<SKPattributemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SKPattributemasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SKPattributemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
