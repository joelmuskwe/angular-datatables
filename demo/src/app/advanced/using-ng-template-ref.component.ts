import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ADTSettings } from 'angular-datatables';
import { IDemoNgComponentEventType } from './demo-ng-template-ref-event-type';
import { DemoNgComponent } from './demo-ng-template-ref.component';

@Component({
  selector: 'app-using-ng-template-ref',
  templateUrl: './using-ng-template-ref.component.html',
})
export class UsingNgTemplateRefComponent implements OnInit {

  constructor() { }

  pageTitle = 'Using Angular TemplateRef';
  mdIntro = 'assets/docs/advanced/using-ng-template-ref/intro.md';
  mdHTML = 'assets/docs/advanced/using-ng-template-ref/source-html.md';
  mdTS = 'assets/docs/advanced/using-ng-template-ref/source-ts.md';

  dtOptions: ADTSettings = {};

  @ViewChild('demoNg', { static: true }) demoNg!: TemplateRef<DemoNgComponent>;
  message = '';

  ngOnInit(): void {
      const self = this;
      this.dtOptions = {
        ajax: 'data/data.json',
        columns: [
          {
            title: 'ID',
            data: 'id'
          },
          {
            title: 'First name',
            data: 'firstName',
          },
          {
            title: 'Last name',
            data: 'lastName'
          },
          {
            title: 'Actions',
            data: null,
            defaultContent: '',
            ngTemplateRef: {
              ref: this.demoNg,
              context: {
                // needed for capturing events inside <ng-template>
                captureEvents: self.onCaptureEvent.bind(self)
              }
            }
          }
        ]
      };
  }

  onCaptureEvent(event: IDemoNgComponentEventType) {
    this.message = `Event '${event.cmd}' with data '${JSON.stringify(event.data)}`;
  }
}
