import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVersionMessageComponent } from './new-version-message.component';

describe('NewVersionMessageComponent', () => {
  let component: NewVersionMessageComponent;
  let fixture: ComponentFixture<NewVersionMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewVersionMessageComponent]
    });
    fixture = TestBed.createComponent(NewVersionMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
