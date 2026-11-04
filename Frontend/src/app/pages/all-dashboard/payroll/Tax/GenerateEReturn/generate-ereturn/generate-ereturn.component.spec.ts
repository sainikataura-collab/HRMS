import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateEreturnComponent } from './generate-ereturn.component';

describe('GenerateEreturnComponent', () => {
  let component: GenerateEreturnComponent;
  let fixture: ComponentFixture<GenerateEreturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateEreturnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateEreturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
