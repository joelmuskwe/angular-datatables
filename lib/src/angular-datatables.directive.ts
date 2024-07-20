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
import { Api } from "datatables.net";
import { ADTColumns, ADTSettings } from "./models/settings";

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
  private _instance?: Api<any>;

  ngOnChanges(changes: SimpleChanges): void {
    const { dtOptions, data } = changes;

    if (!dtOptions && !data) {
      this.displayTable();
      return;
    }

    if (data?.currentValue) {
      this._dtOptions = {
        ...this._dtOptions,
        ...this.dtOptions,
        data: data.currentValue,
      };
      this.displayTable($.fn.DataTable.isDataTable($(this.el.nativeElement)));
    } else if (dtOptions) {
      this._dtOptions = {
        ...this._dtOptions,
        ...this.dtOptions,
      };
      this.displayTable(!dtOptions.firstChange);
    }
  }

  ngOnInit(): void {
    if (!Object.keys(this.dtOptions).length && !this.data) {
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

  private displayTable(destroy = false): void {
    const tableElement = $(this.el.nativeElement);

    if (
      !Object.keys(this._dtOptions).length &&
      !$("tbody tr", tableElement).length
    ) {
      throw new Error(`Both the table's data and dtOptions cannot be empty.`);
    }

    this._dtOptions.columns =
      this._dtOptions.columns ?? this.generateColumnsFromData();

    if (destroy && $.fn.DataTable.isDataTable(tableElement) && this._instance) {
      this._instance.destroy();
      tableElement.empty();
    }

    const options: ADTSettings = {
      rowCallback: (row, data, index) => {
        this.applyTransforms(row, this._dtOptions.columns!, data);
        this._dtOptions.rowCallback?.(row, data, index);
      },
    };

    this._instance = tableElement.DataTable({ ...this._dtOptions, ...options });
  }

  private generateColumnsFromData(): ADTColumns[] {
    return (
      this._dtOptions.data?.map((property, index) => ({
        id: this.getColumnUniqueId(),
        title: Object.keys(property)[index],
        data: Object.keys(property)[index],
      })) ?? []
    );
  }

  private applyTransforms(
    row: Node,
    columns: ADTColumns[],
    data: object | T[]
  ): void {
    this.applyNgPipeTransform(row, columns, data);
    this.applyNgRefTemplate(row, columns, data);
  }

  private applyNgPipeTransform(
    row: Node,
    columns: ADTColumns[],
    data: object | T[]
  ): void {
    columns
      .filter((col) => col.ngPipeInstance && !col.ngTemplateRef)
      .forEach((col) => {
        const index = this.getColumnIndex(columns, col.id);
        if (index === -1) return;

        const cell = row.childNodes.item(index);
        if (!cell) return;

        const value = Array.isArray(data)
          ? data.map((item) => (item as any)[col.data as string])
          : (data as any)[col.data as string];

        cell.textContent =
          col.ngPipeInstance?.transform(value, ...(col.ngPipeArgs || [])) ?? "";
      });
  }

  private applyNgRefTemplate(
    row: Node,
    columns: ADTColumns[],
    data: object | T[]
  ): void {
    columns
      .filter((col) => col.ngTemplateRef && !col.ngPipeInstance)
      .forEach((col) => {
        const index = this.getColumnIndex(columns, col.id);
        if (index === -1) return;

        const cell = row.childNodes.item(index) as HTMLElement;
        if (!cell) return;

        cell.innerHTML = "";

        const { ref, context } = col.ngTemplateRef!;
        const _context = { ...context, ...context?.userData, adtData: data };

        if (ref && _context) {
          try {
            const instance = this.vcr.createEmbeddedView(ref, _context);
            instance.detectChanges();
            instance.rootNodes.forEach((node) =>
              this.renderer.appendChild(cell, node)
            );
          } catch (error) {
            console.error("Error creating embedded view", error);
          }
        }
      });
  }

  private getColumnIndex(columns: ADTColumns[], id?: string): number {
    return id !== undefined ? columns.findIndex((col) => col.id === id) : -1;
  }

  private getColumnUniqueId(): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((byte) => characters[byte % characters.length])
      .join("");
  }
}
