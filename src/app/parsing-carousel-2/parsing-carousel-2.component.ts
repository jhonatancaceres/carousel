import { AfterViewInit, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { PDFLibService } from './pdf-lib.service';
import { ParsingDocumentsState } from './type';

@Component({
  selector: 'parsing-carousel-2',
  templateUrl: './parsing-carousel-2.component.html',
  styleUrls: ['./parsing-carousel-2.component.sass']
})
export class ParsingCarousel2Component implements OnInit {
  

  @ViewChildren('page', { read: ElementRef }) pagesEl!: QueryList<ElementRef>

  isLoadingDocument = false
  sections: NodeList | undefined
  state: ParsingDocumentsState = new ParsingDocumentsState()

  constructor(
    private pdfLibService: PDFLibService,
    private renderer: Renderer2,
  ) { }

  ngOnInit(): void {
    this.sections = document.querySelectorAll('.pages>div')
  }

  selectFile(event: any) {
    const index = Number(event?.target.value)
    if (this.state.fileRanges[index]) {
      this.resetTransitions()
      this.state.moveSlotsToFileIndex(Number(event?.target.value))
      this.renderDocument()
    }
  }

  uploadFiles(fileInput: HTMLInputElement) {

    const filesTemp = Array.prototype.slice.call(fileInput?.files)

    if (!filesTemp.length) return

    this.isLoadingDocument = true

    this.pdfLibService.uploadDocuments(filesTemp).then(files => {
      this.state.resetSlots(files)
      this.resetTransitions()
      this.renderDocument()

      this.isLoadingDocument = false
    })
    return

  }

  go(action: 'prev' | 'next') {
    if (!this.state.isMovementPossible(action)) {      
      return
    } 
    this.state.moveSlots(action)

    // Timeout for the image rendering so it happens behind the animation
    setTimeout(() => {
      this.renderDocument()
    }, 80)

    this.animateTransition(action)
  }

  animateTransition(action: 'prev' | 'next') {

    this.pagesEl.forEach(item => {

      const classes = ['first', 'second', 'third', 'fourth', 'fifth']
      const classIndex = classes.findIndex(e => e === item.nativeElement.className)

      this.renderer.removeClass(item.nativeElement, classes[classIndex]);
      const nextIndex = action === 'prev' ? classIndex + 1 : classIndex - 1;
      this.renderer.addClass(
        item.nativeElement,
        nextIndex === classes.length
          ? classes[0]
          : nextIndex === -1
          ? classes[classes.length - 1]
          : classes[nextIndex]
      )
    })
  }

  resetTransitions() {
    const classes = ['first', 'second', 'third', 'fourth', 'fifth']
    for (let index = 0; index < this.pagesEl.length; index++) {
      const element = this.pagesEl.get(index)
      if (element) {
        element.nativeElement.classList = [classes[index]]
      }
    }
  }

  renderDocument() {
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
          imageCreator.instance = div
          this.state.getImage(i).instance = div
          resolve(imageCreator.instance)
        })
      })
    })


  }


}
