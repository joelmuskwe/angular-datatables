import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";

import { ADTSettings, DataTableDirective } from "angular-datatables";

@Component({
  selector: "app-individual-column-filtering",
  templateUrl: "individual-column-filtering.component.html",
})
export class IndividualColumnFilteringComponent
  implements OnInit, AfterViewInit
{
  pageTitle = "Individual column searching";
  mdIntro = "assets/docs/advanced/indi-col-filter/intro.md";
  mdHTML = "assets/docs/advanced/indi-col-filter/source-html.md";
  mdTS = "assets/docs/advanced/indi-col-filter/source-ts.md";
  mdTSV1 = "assets/docs/advanced/indi-col-filter/source-ts-dtv1.md";

  @ViewChild(DataTableDirective, { static: false })
  datatableElement!: DataTableDirective<any>;

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

  ngAfterViewInit(): void {
    this.datatableElement.instance &&
      this.datatableElement.instance.columns().every(function () {
        const that = this;
        $("input", this.footer()).on("keyup change", function () {
          const inputElement = this as HTMLInputElement;
          if (that.search() !== inputElement.value) {
            that.search(inputElement.value).draw();
          }
        });
      });
  }
}
