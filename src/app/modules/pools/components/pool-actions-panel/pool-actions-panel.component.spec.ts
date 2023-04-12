import { ComponentFixture, TestBed } from '@angular/core/testing'

import { PoolActionsPanelComponent } from './pool-actions-panel.component'

describe('PoolActionsPanelComponent', () => {
  let component: PoolActionsPanelComponent
  let fixture: ComponentFixture<PoolActionsPanelComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoolActionsPanelComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(PoolActionsPanelComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
