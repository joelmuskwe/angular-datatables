import {
  Directive,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChanges,
  ViewContainerRef,
} from "@angular/core";
import { Subject, BehaviorSubject } from "rxjs";
import { ADTSettings, ADTColumns } from "./models/settings";
import { Api } from "datatables.net";
import { take } from "rxjs/operators";

@Directive({
  selector: "[datatable]",
})
export class DataTableDirective<T extends object>
  implements OnChanges, OnDestroy, OnInit
{
  private readonly el = inject(ElementRef);
  private readonly vcr = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);

  @Input() dtOptions: ADTSettings = {};
  @Input() data: T[] | null = null;

  private _dtOptions: ADTSettings & { data?: T[] } = {
    columnDefs: [
      {
        defaultContent: "-",
        targets: "_all",
      },
    ],
  };
  private _instance?: any;

  ngOnChanges(changes: SimpleChanges): void {
    const { dtOptions, data } = changes;

    if (!dtOptions && !data) {
      this.displayTable();
      return;
    }

    if (data && data.currentValue) {
      this._dtOptions = {
        ...this._dtOptions,
        ...this.dtOptions,
        data: data.currentValue,
      };
      if ($.fn.DataTable.isDataTable($(this.el.nativeElement))) {
        this.displayTable(true);
      } else {
        this.displayTable();
      }
    } else if (dtOptions && dtOptions.firstChange) {
      this._dtOptions = {
        ...this._dtOptions,
        ...this.dtOptions,
      };
      this.displayTable();
    } else if (dtOptions && !dtOptions.firstChange) {
      this.displayTable(true);
    }
  }

  ngOnInit(): void {
    if (Object.keys(this.dtOptions).length === 0 && this.data === null) {
      this.displayTable();
    }
  }

  ngOnDestroy(): void {
    if ($.fn.DataTable.isDataTable($(this.el.nativeElement))) {
      $(this.el.nativeElement).DataTable().destroy();
    }
  }

  get instance(): Api<any> | undefined {
    return this._instance;
  }

  draw = (): void => {
    if (
      $.fn.DataTable.isDataTable($(this.el.nativeElement)) &&
      this._instance
    ) {
      this._instance.draw();
    }
  };

  rerender = (): void => {
    this.displayTable(true);
  };

  private displayTable(destroy = false): void {
    const tableElement = $(this.el.nativeElement);

    const isTableEmpty =
      Object.keys(this._dtOptions).length === 0 &&
      $("tbody tr", tableElement).length === 0;

    if (isTableEmpty) {
      throw new Error(`Both the table's data and dtOptions cannot be empty.`);
    }

    if (this._dtOptions?.columns) {
      for (const column of this._dtOptions.columns) {
        if (!column.id) {
          column.id = this.getColumnUniqueId();
        }
      }
    } else {
      this._dtOptions.columns = this._dtOptions.data?.map(
        (property, index) => ({
          id: this.getColumnUniqueId(),
          title: Object.keys(property)[index],
          data: Object.keys(property)[index],
        })
      );
    }

    if (destroy && $.fn.DataTable.isDataTable(tableElement) && this._instance) {
      this._instance.destroy();
      tableElement.empty();
    }

    const options: ADTSettings = {
      rowCallback: (row, data, index) => {
        if (this._dtOptions?.columns) {
          const { columns } = this._dtOptions;
          this.applyNgPipeTransform(row, columns, data);
          this.applyNgRefTemplate(row, columns, data);
        }

        // run user specified row callback if provided.
        if (this._dtOptions?.rowCallback) {
          this._dtOptions.rowCallback(row, data, index);
        }
      },
    };

    this._instance = tableElement.DataTable({ ...this._dtOptions, ...options });
  }
  private applyNgPipeTransform(
    row: Node,
    columns: ADTColumns[],
    data: object | T[]
  ): void {
    const colsWithPipe = columns.filter(
      (col) => col.ngPipeInstance && !col.ngTemplateRef
    );
    const visibleColumns = columns.filter((col) => col.visible !== false);

    colsWithPipe.forEach((col) => {
      const index =
        col.id !== undefined
          ? visibleColumns.findIndex((visibleCol) => visibleCol.id === col.id)
          : -1;
      if (index === -1) return;

      const cell = row.childNodes.item(index);
      if (!cell) return;

      const pipe = col.ngPipeInstance;
      const pipeArgs = col.ngPipeArgs || [];

      let value: any;
      if (Array.isArray(data)) {
        value = data.map((item) => (item as any)[col.data as string]);
      } else {
        value = (data as any)[col.data as string];
      }

      const transformedText = pipe ? pipe.transform(value, ...pipeArgs) : "";
      cell.textContent = transformedText;
    });
  }

  private applyNgRefTemplate(
    row: Node,
    columns: ADTColumns[],
    data: object | T[]
  ): void {
    // Filter columns using `ngTemplateRef`
    const colsWithTemplate = columns.filter(
      (col) => col.ngTemplateRef && !col.ngPipeInstance
    );

    // Cache visible columns for indexing
    const visibleColumns = columns.filter((col) => col.visible !== false);

    for (const col of colsWithTemplate) {
      if (col.ngTemplateRef) {
        const { ref, context } = col.ngTemplateRef;

        // Find the index of the column using `id`
        const index = visibleColumns.findIndex(
          (visibleCol) => visibleCol.id === col.id
        );
        if (index === -1) {
          continue;
        }

        // Get the <td> element which holds data using index
        const cell = row.childNodes.item(index) as HTMLElement;
        if (!cell) {
          continue;
        }

        // Reset cell before applying the template
        while (cell.firstChild) {
          cell.removeChild(cell.firstChild);
        }

        // Finalize context to be sent to the template
        const _context = { ...context, ...context?.userData, adtData: data };

        // Ensure ref and _context are defined before creating embedded view
        if (!ref || !_context) {
          continue;
        }

        try {
          // Create embedded view and append to the cell
          const instance = this.vcr.createEmbeddedView(ref, _context);
          instance.detectChanges();

          instance.rootNodes.forEach((node) => {
            this.renderer.appendChild(cell, node);
          });
        } catch (error) {
          console.error("Error creating embedded view", error);
        }
      }
    }
  }

  private getColumnUniqueId(): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let result = "";

    for (let i = 0; i < 6; i++) {
      const randomIndex =
        crypto.getRandomValues(new Uint8Array(1))[0] % charactersLength;
      result += characters.charAt(randomIndex);
    }

    return result;
  }
}
