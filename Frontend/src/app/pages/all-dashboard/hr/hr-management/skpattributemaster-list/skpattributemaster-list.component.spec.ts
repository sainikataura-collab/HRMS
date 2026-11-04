import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SKPattributemasterListComponent } from './skpattributemaster-list.component';

describe('SKPattributemasterListComponent', () => {
  let component: SKPattributemasterListComponent;
  let fixture: ComponentFixture<SKPattributemasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SKPattributemasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SKPattributemasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
