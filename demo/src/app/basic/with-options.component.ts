import { Component, OnInit } from '@angular/core';
import { ADTSettings } from 'angular-datatables';

@Component({
  selector: 'app-with-options',
  templateUrl: 'with-options.component.html'
})
export class WithOptionsComponent implements OnInit {

  pageTitle = 'With Options';
  mdIntro = 'assets/docs/basic/with-options/intro.md';
  mdHTML = 'assets/docs/basic/with-options/source-html.md';
  mdTS = 'assets/docs/basic/with-options/source-ts.md';
  mdTSV1 = 'assets/docs/basic/with-options/source-ts-dtv1.md';

  dtOptions: ADTSettings = {};

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers'
    };
  }
}
