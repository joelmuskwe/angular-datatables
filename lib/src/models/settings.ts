import { PipeTransform, TemplateRef } from "@angular/core";
import { Config, ConfigColumns } from "datatables.net";

export interface ADTSettings extends Omit<Config, "data"> {
  columns?: ADTColumns[];
}

export interface ADTColumns extends ConfigColumns {
  id?: string;
  ngPipeInstance?: PipeTransform;
  ngPipeArgs?: any[];
  ngTemplateRef?: ADTTemplateRef;
}

export interface ADTTemplateRef {
  ref: TemplateRef<any>;
  context?: ADTTemplateRefContext;
}

export interface ADTTemplateRefContext {
  captureEvents: (...args: any[]) => void;
  userData?: any;
}
