import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import { NativeApiProvider } from "../../providers/native-api/native-api";

const PAGE_TIMEOUT: number = 60000;

@Component({
  selector: "page-setting3",
  templateUrl: "setting3.html"
})
export class Setting3Page {
  protected bgurl: string = "";
  protected curTheme: number = 0;
  private timer: number = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeSvr: NativeApiProvider
  ) { }

  ionViewDidLoad() {
    this.curTheme = this.globalSvr.themeId;
    this.bgurl = this.globalSvr.getBackground(this.curTheme);
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

  protected onSetTheme(id: number) {
    this.curTheme = id;
    this.bgurl = this.globalSvr.getBackground(this.curTheme);
  }

  protected onSave(event: any) {
    this.globalSvr.themeId = this.curTheme;
    this.nativeSvr.setConfig("theme", String(this.globalSvr.themeId));
    this.navCtrl.pop();
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
