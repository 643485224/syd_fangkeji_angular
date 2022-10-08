import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import { WebapiProvider } from "../../providers/webapi/webapi";
import { NativeApiProvider } from "../../providers/native-api/native-api";
import { DataAccessLayerProvider } from '../../providers/data-access-layer/data-access-layer';
import { Setting1Page } from "./setting1";
import { Setting2Page } from "./setting2";
import { Setting3Page } from "./setting3";
import { Setting4Page } from "./setting4";
import { Setting5Page } from "./setting5";
import { Setting6Page } from "./setting6";
import { Setting7Page } from "./setting7";
import { Setting8Page } from "./setting8";
import { Setting9Page } from './setting9';
import { Setting10Page } from './setting10';
import { Setting11Page } from './setting11';
import { Setting12Page } from './setting12';

const PAGE_TIMEOUT: number = 60000;

@IonicPage()
@Component({
  selector: "page-setting",
  templateUrl: "setting.html"
})
export class SettingPage {  // 系统设置页面
  protected index: number = 0;
  protected soft_ver: string = "0.0.1";
  protected web_ver: string = "0.0.1";
  protected bStyle: boolean = false; /// TEST
  private timer: number = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public webApiSvr: WebapiProvider,
    public nativeSvr: NativeApiProvider,
    public dalSvr: DataAccessLayerProvider
  ) { }

  ionViewDidLoad() {
    try {
      let tmp: string;
      let obj: any = null;

      this.web_ver = this.globalSvr.webVersion.split('_')[0];

      if (window.$native) {
        tmp = window.$native.getInfo();
        obj = JSON.parse(tmp);
      }

      if ('SoftVer' in obj) {
        this.soft_ver = obj.SoftVer.split('_')[0];
      }

      if ('PrinterType' in obj) {
        switch (obj.PrinterType) {
          //研科 & 美松
          case 2:
          case 3:
            this.bStyle = true;
            break;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  private createTimer() {
    if (this.timer) return;

    this.timer = window.setInterval(() => {
      if (this.timer && this.globalSvr.checkTimeout()) {
        this.navCtrl.popToRoot();
        this.cleanTimer();
      }
    }, 1000);
  }

  private cleanTimer() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  ionViewDidEnter() {
    this.createTimer();
  }

  ionViewDidLeave() {
    this.cleanTimer();
  }

  protected onEnterSetup(id: number) {
    switch (id) {
      case 1:
        this.navCtrl.push(Setting1Page);
        break;
      case 2:
        this.navCtrl.push(Setting2Page);
        break;
      case 3:
        this.navCtrl.push(Setting3Page);
        break;
      case 4:
        this.navCtrl.push(Setting4Page);
        break;
      case 5:
        this.navCtrl.push(Setting5Page);
        break;
      case 6:
        this.navCtrl.push(Setting6Page);
        break;
      case 7:
        this.navCtrl.push(Setting7Page);
        break;
      case 8:
        this.navCtrl.push(Setting8Page);
        break;
      case 9:
        this.navCtrl.push(Setting9Page);
        break;
      case 10:
        this.navCtrl.push(Setting10Page);
        break;
      case 11:
        this.navCtrl.push(Setting11Page);
        break;
      case 12:
        this.navCtrl.push(Setting12Page);
        break;
    }
  }

  protected async onExit() {
    let bool: boolean;

    bool = await this.globalSvr.showConfirm("警告", "确认要退出访客登记系统?");

    if (bool) {
      this.globalSvr.showLoading("正在退出系统");

      try {
        await this.dalSvr.uninit();
      } catch (err) {
        console.error(err);
      }

      if (!this.globalSvr.offlineMode) {
        try {
          this.webApiSvr.isHold = false;
          await this.webApiSvr.unregister(2000);
        } catch (err) {
          console.error(err);
        }
      }

      window.setTimeout(() => {
        this.nativeSvr.exit(0);
      }, 60);

      window.setTimeout(() => {
        this.nativeSvr.exit(1);
      }, 260);
    }
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
