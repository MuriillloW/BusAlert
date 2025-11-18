import { TestBed } from '@angular/core/testing';

import { Arduino } from './arduino';

describe('Arduino', () => {
  let service: Arduino;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Arduino);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
