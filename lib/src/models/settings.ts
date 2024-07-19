import { PipeTransform, TemplateRef } from '@angular/core';
import { Config, ConfigColumns } from 'datatables.net';

export interface ADTSettings extends Omit<Config, 'data'> {
  columns?: ADTColumns[];
  buttons?: any[];
  colReorder?: any;
  responsive?: boolean;
  select?: boolean;
    /**
   * The name of the user
   */
  fixedColumns?: any;
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
