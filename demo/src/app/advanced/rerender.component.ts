import {
  Component,
  OnInit,
  ViewChild
} from "@angular/core";
import { ADTSettings, DataTableDirective } from "angular-datatables";

@Component({
  selector: "app-rerender",
  templateUrl: "rerender.component.html",
})
export class RerenderComponent implements OnInit {
  pageTitle = "Rerender";
  mdIntro = "assets/docs/advanced/rerender/intro.md";
  mdHTML = "assets/docs/advanced/rerender/source-html.md";
  mdTS = "assets/docs/advanced/rerender/source-ts.md";
  mdTSV1 = "assets/docs/advanced/rerender/source-ts-dtv1.md";

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective<any>;

  dtOptions: ADTSettings = {};

  ngOnInit(): void {
    this.dtOptions = {
      ajax: "data/data.json",
      columns: [
        {
          title: "ID",
          data: "id",
        },
        {
          title: "First name",
          data: "firstName",
        },
        {
          title: "Last name",
          data: "lastName",
        },
      ],
    };
  }

  rerender(): void {
    this.dtElement.rerender();
  }
}
