import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateLettersComponent } from './generate-letters.component';

describe('GenerateLettersComponent', () => {
  let component: GenerateLettersComponent;
  let fixture: ComponentFixture<GenerateLettersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateLettersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateLettersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
