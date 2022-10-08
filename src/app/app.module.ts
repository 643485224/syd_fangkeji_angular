import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule, Config } from "ionic-angular";
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { PipesModule } from '../pipes/pipes.module';
import { ComponentsModule } from "../components/components.module";
import { NativeApiProvider } from "../providers/native-api/native-api";
import { GlobalProvider } from "../providers/global/global";
import { WebapiProvider } from '../providers/webapi/webapi';
import { DataAccessLayerProvider } from '../providers/data-access-layer/data-access-layer';
import { EntryOnlinePageModule } from "../pages/entry-online/entry-online.module";
import { EntryOfflinePageModule } from '../pages/entry-offline/entry-offline.module';
import { WelcomePageModule } from "../pages/welcome/welcome.module";
import { MyApp } from "./app.component";
import { HomePage } from "../pages/home/home";
import { FadeTansition } from '../transitions/md-page-transition';
import * as Common from './common';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { MyHammerGestureConfig } from '../providers/hammer.config';
/** 注册语言包 **/
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
registerLocaleData(zh);


@NgModule({
  declarations: [MyApp, HomePage],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgZorroAntdModule.forRoot(),
    PipesModule,
    ComponentsModule,
    EntryOnlinePageModule,
    EntryOfflinePageModule,
    WelcomePageModule,
    IonicModule.forRoot(MyApp, {
      scrollAssist: false
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, HomePage],
  providers: [
    NativeApiProvider,
    GlobalProvider,
    WebapiProvider,
    DataAccessLayerProvider,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerGestureConfig }
  ]
})
export class AppModule {
  constructor(config: Config) {
    try {
      let bool: boolean;

      bool = Common.getBool(window.$native.getConfig("disable_page_transition", ""));

      if (bool) {
        config.setTransition("fade-transition", FadeTansition);
        config.setModeConfig('md', { pageTransition: "fade-transition" });
      }
    } catch (err) {
      console.error();
    }
  }
}
