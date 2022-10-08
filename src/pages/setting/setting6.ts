import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import {
  NativeApiProvider,
  TaskCode
} from "../../providers/native-api/native-api";
import { GlobalProvider } from "../../providers/global/global";

const PAGE_TIMEOUT: number = 60000;

@Component({
  selector: "page-setting6",
  templateUrl: "setting6.html"
})
export class Setting6Page {
  protected devices: string[] = new Array<string>();
  protected printer1: string = "";
  protected printer2: string = "";
  protected printer3: string = "";
  protected printer4: string = "";
  private timer: number = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public nativeApi: NativeApiProvider,
    public globalSvr: GlobalProvider
  ) { }

  ionViewDidLoad() {
    this.update();
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

  private async update() {
    try {
      let list: string[];
      let val: string;

      list = await this.nativeApi.GetPrinterList();

      if (list && list.length !== 0) this.devices = list;

      val = this.nativeApi.getConfig("cfg_printer1");
      this.printer1 = val || "";

      val = this.nativeApi.getConfig("cfg_printer2");
      this.printer2 = val || "";

      val = this.nativeApi.getConfig("cfg_printer3");
      this.printer3 = val || "";

      val = this.nativeApi.getConfig("cfg_printer4");
      this.printer4 = val || "";
    } catch (err) {
      console.error(err);
    }
  }

  protected async onPrint(id: number) {
    let promise: Promise<any>;

    promise = this.nativeApi.execTask(TaskCode.TASK_PRINT_TEXT_BY_SN, 0, "测试文本,测试文本,测试文本!!!");

    if (promise) {
      this.globalSvr.showLoading("执行打印任务中");
      await promise;
      this.globalSvr.hideLoading();
      this.globalSvr.showAlert("提示", "打印完毕!");
    }
  }

  protected onSave(event: any) {
    this.nativeApi.setConfig("cfg_printer1", String(this.printer1));
    this.nativeApi.setConfig("cfg_printer2", String(this.printer2));
    this.nativeApi.setConfig("cfg_printer3", String(this.printer3));
    this.nativeApi.setConfig("cfg_printer4", String(this.printer4));
    this.navCtrl.pop();
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
