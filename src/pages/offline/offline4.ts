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
import { Offline5Page } from "./offline5";

@Component({
  selector: "page-offline4",
  templateUrl: "offline4.html"
})
export class Offline4Page { // 抓拍人脸页面
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
    this.rootParams = {
      mode: this.globalSvr.offline.b64head ? 2 : 1,
      offline: true,
      bitmap: this.globalSvr.offline.b64head ? this.globalSvr.offline.b64head : "",
    };
  }

  ionViewDidLoad() {  // 页面加载的时候触发，仅在页面创建的时候触发一次
    this.setHandler();
  }

  ionViewWillUnload() {
    this.cleanHandler();
  }

  private setHandler() {
    this.sub = this.nativeApi
      .subscribe_Event()  // 调用事件接口
      .subscribe((event: AndroidEvent) => {
        switch (event.Code) {
          case EventCode.EVENT_FIND_FACE:   //EventCode 为1
            console.log("onEvent FIND_FACE", event);
            this.globalSvr.offline.b64picture = event.Param1;
            this.navCtrl.push(Offline5Page); // 跳转访客登记 - 登记并打印凭条页面
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
