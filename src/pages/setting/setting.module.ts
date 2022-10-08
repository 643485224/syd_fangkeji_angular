import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { PipesModule } from "../../pipes/pipes.module";
import { ComponentsModule } from "../../components/components.module";
import { SettingPage } from "./setting";
import { Setting1Page } from "./setting1";
import { Setting2Page } from "./setting2";
import { Setting3Page } from "./setting3";
import { Setting4Page } from "./setting4";
import { Setting5Page } from "./setting5";
import { Setting6Page } from "./setting6";
import { Setting7Page } from "./setting7";
import { Setting8Page } from "./setting8";
import { Setting9Page } from "./setting9";
import { Setting10Page } from "./setting10";
import { Setting11Page } from "./setting11";
import { Setting12Page } from "./setting12";
import { DetailsPageModule } from "../details/details.module";

@NgModule({
  declarations: [
    SettingPage,
    Setting1Page,
    Setting2Page,
    Setting3Page,
    Setting4Page,
    Setting5Page,
    Setting6Page,
    Setting7Page,
    Setting8Page,
    Setting9Page,
    Setting10Page,
    Setting11Page,
    Setting12Page
  ],
  entryComponents: [
    Setting1Page,
    Setting2Page,
    Setting3Page,
    Setting4Page,
    Setting5Page,
    Setting6Page,
    Setting7Page,
    Setting8Page,
    Setting9Page,
    Setting10Page,
    Setting11Page,
    Setting12Page
  ],
  imports: [
    PipesModule,
    ComponentsModule,
    DetailsPageModule,
    IonicPageModule.forChild(SettingPage)
  ]
})
export class SettingPageModule {}
