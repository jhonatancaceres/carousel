import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ParsingCarousel2Component } from './parsing-carousel-2/parsing-carousel-2.component';
import { PDFLibService } from './parsing-carousel-2/pdf-lib.service';

@NgModule({
  declarations: [
    AppComponent, 
    ParsingCarousel2Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [PDFLibService],
  bootstrap: [AppComponent]
})
export class AppModule { }
