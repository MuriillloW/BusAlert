import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ZeroPagePage } from './zero-page.page';

describe('ZeroPagePage', () => {
  let component: ZeroPagePage;
  let fixture: ComponentFixture<ZeroPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ZeroPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
