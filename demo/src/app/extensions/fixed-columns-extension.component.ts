import { Component, OnInit } from '@angular/core';
import { ADTSettings } from "angular-datatables";
import 'datatables.net-fixedcolumns';

@Component({
  selector: 'app-fixed-columns-extension',
  templateUrl: 'fixed-columns-extension.component.html'
})
export class FixedColumnsExtensionComponent implements OnInit {

  pageTitle = 'DataTables Fixed Columns extension';
  mdIntro = 'assets/docs/extensions/fixedcolumns/intro.md';
  mdInstall = 'assets/docs/extensions/fixedcolumns/installation.md';
  mdHTML = 'assets/docs/extensions/fixedcolumns/source-html.md';
  mdTS = 'assets/docs/extensions/fixedcolumns/source-ts.md';
  mdTSV1 = 'assets/docs/extensions/fixedcolumns/source-ts-dtv1.md';

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
        data: 'lastName'
      },
      {
        title: 'Last name',
        data: 'lastName'
      },
      {
        title: 'Last name',
        data: 'lastName'
      },
      {
        title: 'Last name',
        data: 'lastName'
      },
      {
        title: 'Last name',
        data: 'lastName'
      },
      {
        title: 'Last name',
        data: 'lastName'
      },
      {
        title: 'Last name',
        data: 'lastName'
      },
      {
        title: 'Last name',
        data: 'lastName'
      },
      {
        title: 'Last name',
        data: 'lastName'
      }, {
        title: 'Last name',
        data: 'lastName'
      },
      {
        title: 'Last name',
        data: 'lastName'
      }, {
        title: 'Last name',
        data: 'lastName'
      },
      {
        title: 'Last name',
        data: 'lastName'
      }, {
        title: 'Last name',
        data: 'lastName'
      },
      {
        title: 'Last name',
        data: 'lastName'
      }, {
        title: 'Last name',
        data: 'lastName'
      }

    ],
    // Make sure that scrollX is set to true for this to work!
    scrollX: true,
    fixedColumns: {
        left: 3,
        right: 0
      },
    };
  }
}
