import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { NativeApiProvider } from "../../providers/native-api/native-api";
import { GlobalProvider } from '../../providers/global/global';
import { getBool } from '../../app/common';

const PAGE_TIMEOUT: number = 60000;

@Component({
  selector: "page-setting5",
  templateUrl: "setting5.html"
})
export class Setting5Page {
  protected ocr_mirror: boolean = false;
  protected enable_epp: boolean = false;
  private timer: number = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public nativeSvr: NativeApiProvider,
    public globalSvr: GlobalProvider
  ) { }

  ionViewDidLoad() {
    this.ocr_mirror = getBool(this.nativeSvr.getConfig("ocr_mirror"));
    this.enable_epp = getBool(this.nativeSvr.getConfig("enable_epp"));
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


  protected onSave(event: any) {
    this.globalSvr.enableEpp = this.enable_epp;
    this.nativeSvr.setConfig("ocr_mirror", String(this.ocr_mirror));
    this.nativeSvr.setConfig("enable_epp", String(this.enable_epp));
    this.navCtrl.pop();
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
