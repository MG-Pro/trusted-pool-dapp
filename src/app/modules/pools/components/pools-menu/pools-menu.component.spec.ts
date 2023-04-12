import { ComponentFixture, TestBed } from '@angular/core/testing'

import { PoolsMenuComponent } from './pools-menu.component'

describe('PoolsMenuComponent', () => {
  let component: PoolsMenuComponent
  let fixture: ComponentFixture<PoolsMenuComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoolsMenuComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(PoolsMenuComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
