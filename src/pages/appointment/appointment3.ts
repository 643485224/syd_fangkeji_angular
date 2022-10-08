import { Component, ViewChild } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import { Appointment4Page } from "./appointment4";
import { GetFacePage } from "../get-face/get-face";
import { Subscription } from "rxjs";
import { FullVisitorInfo } from '../../providers/webapi/webapi';
import {
  NativeApiProvider,
  AndroidEvent,
  EventCode
} from "../../providers/native-api/native-api";

@Component({
  selector: "page-appointment3",
  templateUrl: "appointment3.html"
})
export class Appointment3Page {
  protected rootPage: any = GetFacePage;
  protected rootParams: any = {};
  private sub: Subscription;
  @ViewChild("pageNav") protected page: any;

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

  ionViewDidLoad() {

  }

  ionViewDidEnter() {// 进入页面时触发
    this.setHandler(); // 调用setHandler方法
  }

  ionViewDidLeave() {//离开页面时触发
    this.cleanHandler();//调用cleanHandler方法
  }

  private setHandler() {
    this.sub = this.nativeApi
      .subscribe_Event() // 调用事件接口
      .subscribe((event: AndroidEvent) => {
        switch (event.Code) {
          case EventCode.EVENT_FIND_FACE: // EventCode为1
            console.log("onEvent FIND_FACE", event);
            this.globalSvr.checkin.b64picture = event.Param1;
            this.navCtrl.push(Appointment4Page); //跳转到预约来访 - 登记并打印凭条页面
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
