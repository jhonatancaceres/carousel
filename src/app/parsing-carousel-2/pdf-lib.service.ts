import { Injectable } from '@angular/core'
import * as pdfjsLib from 'pdfjs-dist'
import { Observable, Subject } from 'rxjs'
import { ParsingDocumentsFile, ParsingDocumentsPage } from './type'

@Injectable()
export class PDFLibService {
  private state: Subject<any> = new Subject<any>()

  constructor() {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.js'
    //'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.5.207/pdf.worker.js'
    //pdfjsLib.GlobalWorkerOptions.workerSrc = './pdflib/pdf.worker.js';
  }

  async uploadDocuments(files: any[]): Promise<ParsingDocumentsFile[]> {
    if (files.length === 0) return Promise.resolve([])
    return new Promise(async (resolve, reject) => {
      try {
        const results: ParsingDocumentsFile[] = []
        for (let file of files) {
          const pdf = await this.upload(file)
          results.push({
            fileName: file.name,
            pdf,
            pages: this.preparePages(pdf)
          })
        }
        resolve(results)
      } catch (e) {
        console.log('There was an error uploading pdf files', e)
        reject('There was an error uploading pdf files')
      }
    })
  }

  async upload(file: any) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader()
        reader.onload = (result: any) => {
          console.log('Results', result.target.result)
          const data = new Uint8Array(result.target.result)
          const loadingTask = pdfjsLib.getDocument(data)
          loadingTask.promise.then((pdf: any) => {
            resolve(pdf)
          })
        }
        reader.readAsArrayBuffer(file)
      } catch (e) {
        reject({ file, status: 'fail' })
      }
    })
  }

  preparePages(pdf: any): ParsingDocumentsPage[] {
    const pages = []
    for (let i = 0; i < pdf.numPages; i++) {
      pages.push({ numPage: i + 1, instance: null })
    }
    return pages
  }
}
