import { ComponentFixture, TestBed } from '@angular/core/testing'

import { PoolViewComponent } from './pool-view.component'

describe('PoolsComponent', () => {
  let component: PoolViewComponent
  let fixture: ComponentFixture<PoolViewComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoolViewComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(PoolViewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
