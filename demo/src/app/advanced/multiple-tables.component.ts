import { Component, OnInit, QueryList, ViewChildren } from "@angular/core";
import { ADTSettings, DataTableDirective } from "angular-datatables";

@Component({
  selector: "app-multiple-tables",
  templateUrl: "multiple-tables.component.html",
})
export class MultipleTablesComponent implements OnInit {
  pageTitle = "Multiple tables in the same page";
  mdIntro = "assets/docs/advanced/multiple-tables/intro.md";
  mdHTML = "assets/docs/advanced/multiple-tables/source-html.md";
  mdTS = "assets/docs/advanced/multiple-tables/source-ts.md";
  mdTSV1 = "assets/docs/advanced/multiple-tables/source-ts-dtv1.md";

  @ViewChildren(DataTableDirective)
  dtElements!: QueryList<DataTableDirective<any>>;

  dtOptions: ADTSettings[] = [];

  displayToConsole(): void {
    this.dtElements.forEach((dtElement: DataTableDirective<any>, index: number) => {
      console.log(
        `The DataTable ${index} instance ID is: ${
          dtElement.instance && dtElement.instance.table().node()
        }`
      );
      // TODO: .id is not available in the DataTables API
    });

  }

  ngOnInit(): void {
    this.dtOptions[0] = this.buildDtOptions("data/data.json");
    this.dtOptions[1] = this.buildDtOptions("data/data1.json");
  }

  private buildDtOptions(url: string): ADTSettings {
    return {
      ajax: url,
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
}
