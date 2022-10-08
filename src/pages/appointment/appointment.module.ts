import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { PipesModule } from "../../pipes/pipes.module";
import { ComponentsModule } from '../../components/components.module';
import { AppointmentPage } from "./appointment";
import { Appointment2Page } from "./appointment2";
import { Appointment3Page } from "./appointment3";
import { Appointment4Page } from "./appointment4";

@NgModule({
  declarations: [
    AppointmentPage,
    Appointment2Page,
    Appointment3Page,
    Appointment4Page
  ],
  entryComponents: [
    Appointment2Page,
    Appointment3Page,
    Appointment4Page
  ],
  imports: [
    PipesModule,
    ComponentsModule,
    IonicPageModule.forChild(AppointmentPage)
  ]
})
export class AppointmentPageModule {}
