import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateLettersListComponent } from './generate-letters-list.component';

describe('GenerateLettersListComponent', () => {
  let component: GenerateLettersListComponent;
  let fixture: ComponentFixture<GenerateLettersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateLettersListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateLettersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
