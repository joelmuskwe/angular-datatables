import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ADTSettings } from 'angular-datatables';
import { Person } from '../person';

@Component({
  selector: 'app-angular-way',
  templateUrl: 'angular-way.component.html'
})
export class AngularWayComponent implements OnInit {

  pageTitle = 'Angular way';
  mdIntro = 'assets/docs/basic/angular-way/intro.md';
  mdHTML = 'assets/docs/basic/angular-way/source-html.md';
  mdTSV1 = 'assets/docs/basic/angular-way/source-ts.md';

  dtOptions: ADTSettings = {};
  persons: Person[] = [];

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 2
    };
    this.httpClient.get<Person[]>('data/data.json')
      .subscribe(data => {
        this.persons = (data as any).data;
      });
  }
}
