import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NewPoolComponent } from './new-pool.component'

describe('NewPoolComponent', () => {
  let component: NewPoolComponent
  let fixture: ComponentFixture<NewPoolComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPoolComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(NewPoolComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
