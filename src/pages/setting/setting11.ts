import { Component, ApplicationRef, NgZone, ViewChild } from "@angular/core";
import { NavController, NavParams, Select } from "ionic-angular";
import {
  PrintRequest,
  TaskResult,
  NativeApiProvider,
  TaskCode
} from "../../providers/native-api/native-api";
import { GlobalProvider } from "../../providers/global/global";
import { sleep } from "../../app/common";

@Component({
  selector: "page-setting11",
  templateUrl: "setting11.html"
})
export class Setting11Page {
  constructor(
    public appRef: ApplicationRef,
    public zone: NgZone,
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeApi: NativeApiProvider
  ) { }
  protected strRemark: string = "";
  protected dataUrl: string = "";
  //2: 80mm, 3: 58mm
  protected type: number = 0;
  protected formStyle: number = 0;
  protected qrcodeSize: number = 0;
  protected listStyle: Array<{ id: number; name: string }> = new Array();
  protected listSize: Array<{ size: number; name: string }> = new Array();
  private timer: number = null;

  @ViewChild("selStyle")
  protected $selectStyle: Select;

  @ViewChild("selSize")
  protected $selectSize: Select;

  ionViewDidLoad() {
    try {
      this.type = Number(this.globalSvr.info.PrinterType);
    } catch (err) {
      console.error(err);
    }

    try {
      this.formStyle = Number(this.nativeApi.getConfig("form_style"));
      this.qrcodeSize = Number(this.nativeApi.getConfig("qrcode_size"));
    } catch (err) {
      console.error(err);
    }

    switch (this.type) {
      case 2:
        this.strRemark = "(80mm 打印机)";
        this.listStyle = [
          { id: 0, name: "系统默认样式" },
          { id: 1001, name: "80mm 样式1" },
          { id: 1002, name: "80mm 样式2" }
        ];

        this.listSize = [
          { size: 260, name: "2.0 cm" },
          { size: 310, name: "2.5 cm" },
          { size: 360, name: "3.0 cm" },
          { size: 400, name: "3.5 cm" },
          { size: 460, name: "4.0 cm" },
          { size: 510, name: "4.5 cm" },
          { size: 560, name: "5.0 cm" },
          /*
          { size: 610, name: "5.5 cm"},
          { size: 660, name: "6.0 cm"},
          */
        ];
        break;
      case 3:
        this.strRemark = "(58mm 打印机)";
        this.listStyle = [
          { id: 0, name: "系统默认样式" },
          { id: 2001, name: "58mm 样式1" },
          { id: 2002, name: "58mm 样式2" }
        ];

        this.listSize = [
          { size: 240, name: "2.0 cm" },
          { size: 290, name: "2.5 cm" },
          { size: 350, name: "3.0 cm" },
          { size: 400, name: "3.5 cm" },
          { size: 460, name: "4.0 cm" },
          { size: 520, name: "4.5 cm" },
        ];
        break;
      default:
        this.strRemark = "(未知打印机)";
        break;
    }
  }

  private createTimer() {
    if (this.timer) return;

    this.timer = window.setInterval(async () => {
      if (this.timer && this.globalSvr.checkTimeout()) {
        if (this.$selectStyle) await this.$selectStyle.close();
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
    if (this.$selectStyle) this.$selectStyle.close();
    if (this.$selectSize) this.$selectSize.close();
  }

  protected onSave(event: any) {
    this.nativeApi.setConfig("form_style", String(this.formStyle));
    this.nativeApi.setConfig("qrcode_size", String(this.qrcodeSize));
    this.navCtrl.pop();
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
