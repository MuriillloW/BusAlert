import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonPagePage } from './button-page.page';

describe('ButtonPagePage', () => {
  let component: ButtonPagePage;
  let fixture: ComponentFixture<ButtonPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
