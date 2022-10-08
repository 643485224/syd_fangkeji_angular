import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { PipesModule } from "../../pipes/pipes.module";
import { ComponentsModule } from "../../components/components.module";
import { OfflinePage } from "./offline";
import { Offline2Page } from "./offline2";
import { Offline3Page } from "./offline3";
import { Offline4Page } from "./offline4";
import { Offline5Page } from "./offline5";

@NgModule({
  declarations: [
    OfflinePage,
    Offline2Page,
    Offline3Page,
    Offline4Page,
    Offline5Page
  ],
  entryComponents: [Offline2Page, Offline3Page, Offline4Page, Offline5Page],
  imports: [
    PipesModule,
    ComponentsModule,
    IonicPageModule.forChild(OfflinePage)
  ]
})
export class OfflinePageModule {}
