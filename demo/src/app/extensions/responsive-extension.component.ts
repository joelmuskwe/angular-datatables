import { Component, OnInit } from '@angular/core';
import { ADTSettings } from 'angular-datatables';

@Component({
  selector: 'app-responsive-extension',
  templateUrl: 'responsive-extension.component.html'
})
export class ResponsiveExtensionComponent implements OnInit {

  pageTitle = 'DataTables Responsive extension';
  mdIntro = 'assets/docs/extensions/responsive/intro.md';
  mdInstall = 'assets/docs/extensions/responsive/installation.md';
  mdHTML = 'assets/docs/extensions/responsive/source-html.md';
  mdTS = 'assets/docs/extensions/responsive/source-ts.md';
  mdTSV1 = 'assets/docs/extensions/responsive/source-ts-dtv1.md';

  dtOptions: ADTSettings = {};

  ngOnInit(): void {
    this.dtOptions = {
      ajax: 'data/data.json',
      columns: [{
        title: 'ID',
        data: 'id'
      }, {
        title: 'First name',
        data: 'firstName'
      }, {
        title: 'Last name',
        data: 'lastName',
        className: 'none'
      }],
      // Use this attribute to enable the responsive extension
      responsive: true
    };
  }
}
