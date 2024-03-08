import { Component, OnInit } from '@angular/core';
import { PDFLibService } from './pdf-lib.service';
import { ParsingDocumentsState } from './type';

@Component({
  selector: 'parsing-carousel-2',
  templateUrl: './parsing-carousel-2.component.html',
  styleUrls: ['./parsing-carousel-2.component.sass']
})
export class ParsingCarousel2Component implements OnInit {

  title = 'carousel';
  isLoadingDocument = false

  sections: NodeList | undefined


  images: { [key: number]: any } = {}
  current = 0

  state: ParsingDocumentsState = new ParsingDocumentsState()

  constructor(private pdfLibService: PDFLibService) { }
  ngOnInit(): void {
    this.sections = document.querySelectorAll('.pages .page')
  }

  selectFile(event: any) {
    const index = Number(event?.target.value)
    if (this.state.fileRanges[index]) {
      this.state.moveSlotsToFileIndex(Number(event?.target.value))
      this.renderDocument(false)
    }
  }

  uploadFiles(fileInput: HTMLInputElement) {

    const filesTemp = Array.prototype.slice.call(fileInput?.files)

    if (!filesTemp.length) return

    this.isLoadingDocument = true

    this.pdfLibService.uploadDocuments(filesTemp).then(files => {

      this.state.selectedIndex = 0 //this.state.files.length      
      this.state.resetSlots(files)
      this.renderDocument()

      this.isLoadingDocument = false
    })
    return

  }

  go(action: 'prev' | 'next') {
    if (action === 'prev' && this.state.slots[1] == -1 || action === 'next' && this.state.slots[3] == -1) {
      console.log('Nothing')
      return
    }
    this.state.moveSlots(action)
    this.renderDocument(false)
  }




  renderDocument(initial = true) {
    if (initial) {
      const pages = Math.min(this.state.numPages, 3)
      for (let i = 0; i < pages; i++) {
        this.state.slots[i + 2] = i
      }
    }
    this.state.slots.forEach((v, i) => {
      this.renderImage(i, v)
    })
  }

  renderImage(s: number, i: number) {
    const slot = this.sections?.item(s)
    this.getImg(i).then(img => {
      const prevImg = Array.prototype.slice.call(slot?.childNodes).find(it => it.className === 'img')
      if (prevImg) {
        slot?.removeChild(prevImg)
      }
      if (img) {
        slot?.appendChild(img)
      }
    })
  }

  getImg(i: number): Promise<HTMLElement | null> {

    if (i < 0) {
      return Promise.resolve(null)
    }

    const imageCreator = this.state.getImageCreator(i)

    if (imageCreator.instance) {
      return Promise.resolve(imageCreator.instance)
    }

    return imageCreator.pdf.getPage(imageCreator.index).then((page: any) => {

      const viewport = page.getViewport({
        scale: 0.33
      })

      var div = document.createElement('canvas')
      div.className = 'img'
      div.width = 190
      div.height = 270
      const context = div.getContext('2d')
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      return new Promise((resolve, rject) => {
        const renderTask = page.render(renderContext)
        renderTask.promise.then(() => {
          //this.state.currentDocument.pages[i].instance = div
          imageCreator.instance = div
          this.state.getImage(i).instance = div
          resolve(imageCreator.instance)
        })
      })
    })


  }


}
