import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdoRequestComponent } from './cdo-request.component';

describe('CdoRequestComponent', () => {
  let component: CdoRequestComponent;
  let fixture: ComponentFixture<CdoRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdoRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdoRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
