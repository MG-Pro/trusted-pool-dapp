import { Injectable } from '@angular/core'
import { ModalComponent } from '@app/components/modal/modal.component'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config'
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref'

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly defParams: NgbModalOptions = { backdrop: 'static', centered: true }
  constructor(private modalService: NgbModal) {}

  public open(content: string, header = 'Attention!', params?: NgbModalOptions): NgbModalRef {
    const modalRef = this.modalService.open(ModalComponent, { ...this.defParams, ...params })
    modalRef.componentInstance.header = header
    modalRef.componentInstance.content = content
    return modalRef
  }
}
