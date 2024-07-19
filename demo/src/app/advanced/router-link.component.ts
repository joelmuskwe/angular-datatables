import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { IDemoNgComponentEventType } from './demo-ng-template-ref-event-type';
import { DemoNgComponent } from './demo-ng-template-ref.component';
import { ADTSettings } from 'angular-datatables/src/models/settings';

@Component({
  selector: 'app-router-link',
  templateUrl: 'router-link.component.html'
})
export class RouterLinkComponent implements OnInit {

  pageTitle = 'Router Link';
  mdIntro = 'assets/docs/advanced/router-link/intro.md';
  mdHTML = 'assets/docs/advanced/router-link/source-html.md';
  mdTSV1 = 'assets/docs/advanced/router-link/source-ts-dtv1.md';
  mdTS = 'assets/docs/advanced/router-link/source-ts.md';
  mdTSHeading = 'TypeScript';

  dtOptions: ADTSettings = {};

  @ViewChild('demoNg', { static: true }) demoNg!: TemplateRef<DemoNgComponent>;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    const self = this;
    // init here as we use ViewChild ref
    this.dtOptions = {
      ajax: 'data/data.json',
      columns: [
        {
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
          title: 'Action',
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
    this.router.navigate(["/person/" + event.data.id]);
  }
}
