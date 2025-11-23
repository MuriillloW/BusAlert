import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddpontoPage } from './addponto.page';

describe('AddpontoPage', () => {
  let component: AddpontoPage;
  let fixture: ComponentFixture<AddpontoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddpontoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
