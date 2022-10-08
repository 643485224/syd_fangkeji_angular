import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { PipesModule } from "../../pipes/pipes.module";
import { EnterPwdPageModule } from "../enter-pwd/enter-pwd.module";
import { SettingPageModule } from "../setting/setting.module";
import { AppointmentPageModule } from "../appointment/appointment.module";
import { OnsitePageModule } from "../onsite/onsite.module";
import { GetFacePageModule } from '../get-face/get-face.module';
import { CheckoutPageModule } from '../checkout/checkout.module';
import { EntryOnlinePage } from "./entry-online";

@NgModule({
  declarations: [EntryOnlinePage],
  imports: [
    PipesModule,
    EnterPwdPageModule,
    GetFacePageModule,
    SettingPageModule,
    AppointmentPageModule,
    OnsitePageModule,
    CheckoutPageModule,
    IonicPageModule.forChild(EntryOnlinePage)
  ]
})
export class EntryOnlinePageModule {}
