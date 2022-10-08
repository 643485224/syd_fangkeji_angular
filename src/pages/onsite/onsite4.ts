import { Component, ViewChild } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import {
  AndroidEvent,
  EventCode,
  NativeApiProvider
} from "../../providers/native-api/native-api";
import { Subscription } from "rxjs";
import { GetFacePage } from "../get-face/get-face";
import { Onsite5Page } from "./onsite5";

@Component({
  selector: "page-onsite4",
  templateUrl: "onsite4.html"
})
export class Onsite4Page { // 抓拍人脸页面
  protected rootPage: any = GetFacePage;
  protected rootParams: any = {};
  private sub: Subscription;
  @ViewChild("pageNav")
  protected page: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeApi: NativeApiProvider
  ) {
    if ("params" in this.navParams.data) {
      this.rootParams = this.navParams.data.params;
    }
  }

  ionViewDidLoad() { }

  ionViewDidEnter() {
    this.setHandler();
  }

  ionViewDidLeave() {
    this.cleanHandler();
  }

  private setHandler() {
    this.sub = this.nativeApi
      .subscribe_Event()
      .subscribe((event: AndroidEvent) => {
        switch (event.Code) {   // 如果存在event.Code执行下面代码
          case EventCode.EVENT_FIND_FACE:   // 当EventCode为1时
            console.log("onEvent FIND_FACE", event);
            this.globalSvr.onsite.b64picture = event.Param1;
            this.navCtrl.push(Onsite5Page); // 跳转现场登记 - 登记并打印凭条页面
            break;
        }
      });
  }

  private cleanHandler() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
