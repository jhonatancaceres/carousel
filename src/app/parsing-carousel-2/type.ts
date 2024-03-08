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
    this.slots.map((v, i) => {
      if (direction === 'prev' && i) {
        return this.slots[i - 1]
      }
      if (direction === 'prev') {
        if (i) {
          return this.slots[i - 1]
        } else if (v === 0 || v === -1) {
          return -1
        }
        return v - 1
      } else {
        if (i < (this.slots.length - 1)) {
          return this.slots[i + 1]
        } else if (v < (this.numPages - 1)) {
          return v == -1 ? -1 : v + 1
        }
        return - 1
      }
    }).forEach((v, i) => this.slots[i] = v)

    Object.values(this.fileRanges).forEach(range => {
      if (this.slots[2] >= range.from && this.slots[2] < range.to) {
        this.selectedIndex = range.file
      }
    })
  }

  moveSlotsToFileIndex(index: number) {
    this.slots[2] = this.fileRanges[index].from;
    this.slots[1] = this.slots[2] - 1 < 0 ? -1 : this.slots[2] - 1
    this.slots[0] = this.slots[1] - 1 < 0 ? -1 : this.slots[1] - 1
    this.slots[3] = this.slots[2] + 1 > this.numPages ? -1 : this.slots[2] + 1
    this.slots[4] = this.slots[3] + 1 > this.numPages ? -1 : this.slots[3] + 1
    this.selectedIndex = index
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