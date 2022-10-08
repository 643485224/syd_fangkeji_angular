import { Component, ApplicationRef } from '@angular/core';
import { NavController, NavParams } from "ionic-angular";
import { NativeApiProvider } from "../../providers/native-api/native-api";
import { GlobalProvider } from "../../providers/global/global";
import * as Common from "../../app/common";

const PAGE_TIMEOUT: number = 60000;

@Component({
  selector: "page-setting4",
  templateUrl: "setting4.html"
})
export class Setting4Page {
  protected bgurl: string = "";

  protected limit: number = 55;
  protected minCutWidth: number = 500;
  protected maxCutWidth: number = 1000;
  protected cutWidth: number = 600;
  protected minCutHeight: number = 500;
  protected maxCutHeight: number = 700;
  protected cutHeight: number = this.maxCutHeight;
  protected faceQuality: number = 85;
  protected enableOnlyFace: boolean = true;
  protected enableFaceRange: boolean = true;
  protected faceRange: { lower: number, upper: number } = { lower: 300, upper: 400 };

  private timer: number = null;

  constructor(
    public appRef: ApplicationRef,
    public navCtrl: NavController,
    public navParams: NavParams,
    public nativeSvr: NativeApiProvider,
    public globalSvr: GlobalProvider
  ) { }

  private createTimer() {
    if (this.timer) return;

    this.timer = window.setInterval(() => {
      if (this.timer && this.globalSvr.checkTimeout()) {
        console.log("Setting4Page timeout");
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

  ionViewDidLoad() {
    this.bgurl = this.globalSvr.background;
  }

  ionViewWillEnter() {
    let val1: string, val2: string;
    let lower: number = 0, upper: number = 0;

    val1 = this.nativeSvr.getConfig("limit");

    if (!val1) {
      this.limit = 75;
      this.nativeSvr.setConfig("limit", String(this.limit));
    } else {
      this.limit = Number(val1);
    }

    val1 = this.nativeSvr.getConfig("bmp_cut_width");

    if (!val1) {
      this.nativeSvr.setConfig("bmp_cut_width", String(this.cutWidth));
    } else {
      this.cutWidth = Number(val1);
    }


    val1 = this.nativeSvr.getConfig("bmp_cut_height");

    if (!val1) {
      this.cutHeight = this.maxCutHeight;
      this.nativeSvr.setConfig("bmp_cut_height", String(this.cutHeight));
    } else {
      this.cutHeight = Number(val1);
    }

    val1 = this.nativeSvr.getConfig("only_face");

    if (!Common.getBool(val1)) {
      this.enableOnlyFace = false;
    } else {
      this.enableOnlyFace = true;
    }

    val1 = this.nativeSvr.getConfig("check_face_min");
    val2 = this.nativeSvr.getConfig("check_face_max");

    if (!Common.getBool(val1) && !Common.getBool(val2)) {
      this.enableFaceRange = false;
    } else {
      this.enableFaceRange = true;
    }

    val1 = this.nativeSvr.getConfig("min_face_width");

    if (!val1) {
      lower = this.faceRange.lower;
      this.nativeSvr.setConfig("min_face_width", String(lower));
    } else {
      lower = Number(val1);
    }

    val1 = this.nativeSvr.getConfig("max_face_width");

    if (!val1) {
      upper = this.faceRange.upper;
      this.nativeSvr.setConfig("max_face_width", String(this.faceRange.upper));
    } else {
      upper = Number(val1);
    }

    this.faceRange = { lower: lower, upper: upper };

    val1 = this.nativeSvr.getConfig("face_quality");

    if (!val1) {
      this.nativeSvr.setConfig("face_quality", String(this.faceQuality));
    } else {
      this.faceQuality = Number(val1);
    }
  }

  protected onFaceChange(event: any) {
    if (this.enableOnlyFace === false) this.enableFaceRange = false;
  }

  protected onSave(event: any) {
    this.nativeSvr.setConfig("limit", String(this.limit));
    this.nativeSvr.setConfig("bmp_cut_width", String(this.cutWidth));
    this.nativeSvr.setConfig("bmp_cut_height", String(this.cutHeight));
    this.nativeSvr.setConfig("only_face", String(this.enableOnlyFace));
    this.nativeSvr.setConfig("check_face_min", String(this.enableFaceRange));
    this.nativeSvr.setConfig("check_face_max", String(this.enableFaceRange));

    if (this.enableFaceRange) {
      this.nativeSvr.setConfig("min_face_width", String(this.faceRange.lower));
      this.nativeSvr.setConfig("max_face_width", String(this.faceRange.upper));
    }

    this.nativeSvr.setConfig("face_quality", String(this.faceQuality));

    this.navCtrl.pop();
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
