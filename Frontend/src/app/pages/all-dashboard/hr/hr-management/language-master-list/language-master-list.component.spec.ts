import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageMasterListComponent } from './language-master-list.component';

describe('LanguageMasterListComponent', () => {
  let component: LanguageMasterListComponent;
  let fixture: ComponentFixture<LanguageMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanguageMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
