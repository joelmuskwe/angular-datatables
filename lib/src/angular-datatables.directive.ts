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

  /**
   * The options for configuring the Angular DataTables directive.
   */
  @Input() dtOptions: ADTSettings = {};
  /**
   * The data to be displayed in the DataTable.
   * @template T The type of the data.
   */
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

    // If neither dtOptions nor data has changed, display the table
    if (!dtOptions && !data) {
      this.displayTable();
      return;
    }

    // If data has a current value (i.e., it has changed and is not null or undefined)
    if (data?.currentValue) {
      // Update _dtOptions with the new data and existing dtOptions
      this._dtOptions = {
        ...this._dtOptions,
        ...this.dtOptions,
        data: data.currentValue,
      };

      // Display the table, checking if it's already initialized as a DataTable
      this.displayTable($.fn.DataTable.isDataTable($(this.el.nativeElement)));
    } else if (dtOptions) {
      // If only dtOptions has changed, update _dtOptions with the new dtOptions
      this._dtOptions = {
        ...this._dtOptions,
        ...this.dtOptions,
      };

      // Display the table, passing a boolean that indicates if this is not the first change
      this.displayTable(!dtOptions.firstChange);
    }
  }

  ngOnInit(): void {
    // Check if dtOptions is not an empty object and data is not defined or null
    if (!Object.keys(this.dtOptions).length && !this.data) {
      // If both conditions are true, display the table
      this.displayTable();
    }
  }

  ngOnDestroy(): void {
    // Check if the element is currently initialized as a DataTable
    if ($.fn.DataTable.isDataTable($(this.el.nativeElement))) {
      // If true, destroy the DataTable instance
      $(this.el.nativeElement).DataTable().destroy();
    }
  }

  /**
   * Gets the instance of the DataTables API.
   * @returns The instance of the DataTables API.
   */
  get instance(): Api<any> | undefined {
    return this._instance;
  }

  /**
   * Redraws the DataTable instance if it exists.
   */
  draw = (): void => {
    if (
      $.fn.DataTable.isDataTable($(this.el.nativeElement)) &&
      this._instance
    ) {
      this._instance.draw();
    }
  };

  /**
   * Rerenders the DataTable.
   */
  rerender = (): void => {
    this.displayTable(true);
  };

  /**
   * Displays the table using the provided DataTable options.
   * If `destroy` is set to `true`, it destroys the existing DataTable instance and clears the table element before displaying the new table.
   * Throws an error if both the table's data and dtOptions are empty.
   */
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

    const removeEmptyColumns = (settings: ADTSettings): ADTSettings => {
      const { columns, ...rest } = settings;
      return {
        ...rest,
        ...(columns && columns.length > 0 && { columns }),
      };
    };

    this._instance = tableElement.DataTable({
      ...removeEmptyColumns(this._dtOptions),
      ...removeEmptyColumns(options),
    });
  }

  /**
   * Generates an array of ADTColumns based on the data provided in the `_dtOptions`.
   * Each ADTColumn object contains an id, title, and data property.
   * The id is generated using the `getColumnUniqueId` method.
   * The title and data properties are extracted from the keys of the properties in the data array.
   * If `_dtOptions.data` is null or undefined, an empty array is returned.
   *
   * @returns An array of ADTColumns.
   */
  private generateColumnsFromData(): ADTColumns[] {
    return (
      this._dtOptions.data?.map((property, index) => ({
        id: this.getColumnUniqueId(),
        title: Object.keys(property)[index],
        data: Object.keys(property)[index],
      })) ?? []
    );
  }

  /**
   * Applies transformations to the given row using the specified columns and data.
   * This method applies Angular pipe transformations and reference template transformations.
   *
   * @param row - The row to apply transformations to.
   * @param columns - The columns to use for transformations.
   * @param data - The data to be transformed.
   */
  private applyTransforms(
    row: Node,
    columns: ADTColumns[],
    data: object | T[]
  ): void {
    this.applyNgPipeTransform(row, columns, data);
    this.applyNgRefTemplate(row, columns, data);
  }

  /**
   * Applies Angular pipe transformation to the specified row's cells based on the provided columns and data.
   * @param row - The row element to apply the pipe transformation to.
   * @param columns - The array of ADTColumns representing the columns of the table.
   * @param data - The object or array of objects representing the data to be transformed.
   */
  private applyNgPipeTransform(
    row: Node,
    columns: ADTColumns[],
    data: object | T[]
  ): void {
    columns
      ?.filter((col) => col.ngPipeInstance && !col.ngTemplateRef)
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

  /**
   * Applies the Angular template reference to the specified row.
   *
   * @param row - The row element to apply the template to.
   * @param columns - The array of ADTColumns.
   * @param data - The data object or array of data.
   */
  private applyNgRefTemplate(
    row: Node,
    columns: ADTColumns[],
    data: object | T[]
  ): void {
    columns
      ?.filter((col) => col.ngTemplateRef && !col.ngPipeInstance)
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

  /**
   * Returns the index of a column in the specified array of ADTColumns.
   * If the optional `id` parameter is provided, it searches for a column with the matching `id`.
   * If found, it returns the index of the column; otherwise, it returns -1.
   *
   * @param columns - The array of ADTColumns to search in.
   * @param id - The optional id of the column to search for.
   * @returns The index of the column if found; otherwise, -1.
   */
  private getColumnIndex(columns: ADTColumns[], id?: string): number {
    return id !== undefined ? columns.findIndex((col) => col.id === id) : -1;
  }

  /**
   * Generates a unique identifier for a column.
   *
   * @returns A string representing the unique identifier.
   */
  private getColumnUniqueId(): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((byte) => characters[byte % characters.length])
      .join("");
  }
}
