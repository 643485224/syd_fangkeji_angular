import { Component, ViewChild } from "@angular/core";
import { NavController, NavParams, PopoverController, Select } from "ionic-angular";
import { NativeApiProvider } from "../../providers/native-api/native-api";
import { GlobalProvider } from "../../providers/global/global";
import { WebapiProvider } from "../../providers/webapi/webapi";
import { getBool } from "../../app/common";

const PAGE_TIMEOUT: number = 60000;

@Component({
  selector: "page-setting1",
  templateUrl: "setting1.html"
})
export class Setting1Page {
  protected clr1: string = "primary";
  protected clr2: string = "dark";
  protected clr3: string = "dark";
  protected ip: string = "";
  protected port: string = "";
  protected regcode: string = "";
  protected enckey: string = "";
  protected keyMode: number = 1;
  protected focused: number = 1;
  protected offline: boolean = false;
  protected extdb: boolean = false;
  protected accelerated: boolean = false;
  protected bgurl: string = "";
  protected webview: number = 0;
  protected exist_epm: boolean = false;
  protected debug_mode: boolean = false;
  private timer: number = null;

  @ViewChild("selWebView")
  protected $select: Select;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public popCtrl: PopoverController,
    public globalSvr: GlobalProvider,
    public nativeSvr: NativeApiProvider,
    public webApiSvr: WebapiProvider
  ) { }

  ionViewDidLoad() {
    this.loadConfig();
    this.bgurl = this.globalSvr.background;
  }

  private createTimer() {
    if (this.timer) return;

    this.timer = window.setInterval(async () => {
      if (this.timer && this.globalSvr.checkTimeout()) {
        if (this.$select) await this.$select.close();
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
    if (this.$select) this.$select.close();
  }

  private async loadConfig() {
    this.globalSvr.showLoading("读取中");

    window.setTimeout(() => {
      try {
        this.ip = this.nativeSvr.getConfig("ip");
        this.port = this.nativeSvr.getConfig("port");
        this.regcode = this.nativeSvr.getConfig("regcode");
        this.enckey = this.nativeSvr.getConfig("enckey");
        this.offline = getBool(this.nativeSvr.getConfig("offline"));
        this.extdb = getBool(this.nativeSvr.getConfig("use_external_db"));
        this.accelerated = getBool(
          this.nativeSvr.getConfig("hardware_accelerated")
        );
        this.exist_epm = getBool(this.nativeSvr.getConfig("exist_epm"));
        this.debug_mode = getBool(this.nativeSvr.getConfig("debug_mode"));
        this.webview = Number(this.nativeSvr.getConfig("app_webview"));
      } catch (err) {
        console.error(err);
      } finally {
        this.globalSvr.hideLoading();
      }
    }, 5);
  }

  protected onTextClick(id: number) {
    switch (id) {
      case 1:
        this.clr1 = "primary";
        this.clr2 = "dark";
        this.clr3 = "dark";
        this.keyMode = 1;
        break;
      case 2:
        this.clr1 = "dark";
        this.clr2 = "primary";
        this.clr3 = "dark";
        this.keyMode = 0;
        break;
      case 3:
        this.clr1 = "dark";
        this.clr2 = "dark";
        this.clr3 = "primary";
        this.keyMode = 0;
        break;
    }

    this.focused = id;
  }

  protected onNumDown(char: string) {
    switch (this.focused) {
      case 1:
        if (this.ip.length < 15) this.ip += char;
        break;
      case 2:
        if (this.port.length < 5) this.port += char;
        break;
      case 3:
        if (this.regcode.length < 14) this.regcode += char;
        break;
    }
  }

  protected onBackspace() {
    switch (this.focused) {
      case 1:
        if (this.ip.length) this.ip = this.ip.substring(0, this.ip.length - 1);
        break;
      case 2:
        if (this.port.length)
          this.port = this.port.substring(0, this.port.length - 1);
        break;
      case 3:
        if (this.regcode.length)
          this.regcode = this.regcode.substring(0, this.regcode.length - 1);
        break;
    }
  }

  protected onClean() {
    switch (this.focused) {
      case 1:
        this.ip = "";
        break;
      case 2:
        this.port = "";
        break;
      case 3:
        this.regcode = "";
        break;
    }
  }

  protected onSave(event: any) {
    this.nativeSvr.setConfig("ip", this.ip);
    this.nativeSvr.setConfig("port", this.port);
    this.nativeSvr.setConfig("regcode", this.regcode);
    this.nativeSvr.setConfig("enckey", this.enckey);
    this.nativeSvr.setConfig("offline", String(this.offline));
    this.nativeSvr.setConfig("use_external_db", String(this.extdb));
    this.nativeSvr.setConfig("hardware_accelerated", String(this.accelerated));
    this.nativeSvr.setConfig("exist_epm", String(this.exist_epm));
    this.nativeSvr.setConfig("debug_mode", String(this.debug_mode));
    this.nativeSvr.setConfig("app_webview", String(this.webview));

    this.navCtrl.pop();
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
