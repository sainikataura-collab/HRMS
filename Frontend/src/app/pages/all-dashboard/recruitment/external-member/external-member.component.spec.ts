import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalMemberComponent } from './external-member.component';

describe('ExternalMemberComponent', () => {
  let component: ExternalMemberComponent;
  let fixture: ComponentFixture<ExternalMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
