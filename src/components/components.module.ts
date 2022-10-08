import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { TableViewComponent } from "./tableview/tableview";

@NgModule({
  declarations: [TableViewComponent],
  imports: [CommonModule],
  exports: [ TableViewComponent]
})
export class ComponentsModule {}
