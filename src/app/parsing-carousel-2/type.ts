export interface ParsingDocumentsPage {
  numPage: number,
  instance: any,
}

export interface ParsingDocumentsFile {
  fileName: string
  pdf: any// { getPage: () => {} }
  pages: ParsingDocumentsPage[]

}

export class ParsingDocumentsState {

  files: ParsingDocumentsFile[] = []
  selectedIndex: number = -1
  slots = [-1, -1, -1, -1, -1]
  numPages = 0
  fileRanges: { [index: number]: { file: number, from: number, to: number, main: number } } = {}
  animationIndex = 0

  get currentDocument() {
    return this.files[this.selectedIndex]
  }

  resetSlots(files: ParsingDocumentsFile[]) {

    this.files.push(...files)
    this.numPages = this.files.reduce((prev, { pages }) => prev + pages.length, 0)
    this.fileRanges = {}
    let acum = 0
    this.files.forEach(({ pages }, i) => {
      this.fileRanges[i] = { file: i, from: acum, to: acum + pages.length, main: acum }
      acum += pages.length
    })
    this.moveSlotsToFileIndex(0)
  }

  moveSlots(direction: 'prev' | 'next') {
    if (direction === 'next') {
      const lastPage = (Math.max(...this.slots) || 0) + 1
      this.slots[this.animationIndex] = lastPage >= this.numPages ? -1 : lastPage
      this.animationIndex = this.animationIndex === this.slots.length - 1 ? 0 : this.animationIndex + 1
    
    } else {
      const firstPage = Math.min(...this.slots.filter(n => n > -1))
      this.animationIndex = this.animationIndex === 0 ? this.slots.length - 1 : this.animationIndex - 1
      this.slots[this.animationIndex] = firstPage - 1
      
    }

    Object.values(this.fileRanges).forEach(range => {
      if (this.slots[2] >= range.from && this.slots[2] < range.to) {
        this.selectedIndex = range.file
      }
    })
  }

  isMovementPossible(direction: 'prev' | 'next') {
    if (direction === 'prev') {
      let indexToCheck = this.animationIndex + 1
      if (indexToCheck > this.slots.length - 1) indexToCheck = indexToCheck - this.slots.length
      return !(this.slots[indexToCheck] === -1)
    } else {
      let indexToCheck = this.animationIndex - 2
      if (indexToCheck < 0) indexToCheck = this.slots.length + indexToCheck
      return !(this.slots[indexToCheck] === -1)
    }
  }

  moveSlotsToFileIndex(index: number) {
    this.slots[2] = this.fileRanges[index].from;
    this.slots[1] = this.slots[2] - 1 < 0 ? -1 : this.slots[2] - 1
    this.slots[0] = this.slots[1] - 1 < 0 ? -1 : this.slots[1] - 1
    this.slots[3] = this.slots[2] + 1 >= this.numPages ? -1 : this.slots[2] + 1
    this.slots[4] = this.slots[2] + 2 >= this.numPages ? -1 : this.slots[3] + 1
    this.selectedIndex = index
    this.animationIndex = 0
  }


  getImageCreator(i: number): { pdf: any, instance: any, index: number } {
    const result: { pdf: any, instance: any, index: number } = { pdf: null, instance: null, index: 0 }
    let acum = 0
    this.files.forEach(({ pdf, pages }, ii) => {
      if (result.pdf == null && i < (pages.length + acum)) {
        result.instance = pages[i - acum].instance
        result.pdf = pdf
        result.index = i - acum + 1
      }
      acum += pages.length
    })
    return result
  }

  getImage(i: number) {
    return this.files.reduce((prev: ParsingDocumentsPage[], { pages }) => [...prev, ...pages], [])[i]
  }
}