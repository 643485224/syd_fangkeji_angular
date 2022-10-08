import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  Popover,
  PopoverController
} from "ionic-angular";
import { EnterPwdPage } from "../enter-pwd/enter-pwd";
import { SettingPage } from "../setting/setting";
import { OfflinePage } from "../offline/offline";
import { CheckoutPage } from "../checkout/checkout";
import { GlobalProvider } from "../../providers/global/global";
import { WebapiProvider } from "../../providers/webapi/webapi";
import * as Common from "../../app/common";
import {
  NativeApiProvider, TaskCode
} from "../../providers/native-api/native-api";
/**
 * 脱机模式入口页面
 */
@IonicPage({
  segment: "entry-offline"
})
@Component({
  selector: "page-entry-offline",
  templateUrl: "entry-offline.html"
})
export class EntryOfflinePage { //首页
  private timer: number = null;
  protected text: string = "";
  protected Taskid: any;
  protected endTime: any;
  protected start: number = 0;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public popCtrl: PopoverController,
    public globalSvr: GlobalProvider,
    public webApiSvr: WebapiProvider,
    public nativeApi: NativeApiProvider,
  ) { }

  ionViewDidLoad() {
    this.text = Common.formatChsText(new Date());
    var TaskArray = JSON.parse(this.nativeApi.getConfig("Task"))
    this.timer = window.setInterval(() => {
      this.text = Common.formatChsText(new Date());
      let restartTime = this.text.substring(12, 20);//截当前时间
      let today = new Date().getDay();//获取当前星期几
      // console.log("TaskArray", TaskArray);
      for (let index = 0; index < TaskArray.length; index++) {
        this.Taskid = TaskArray[index].id;//获取星期几
        this.endTime = TaskArray[index].endTime;//自定义时间
        if (this.Taskid == today) {
          if (restartTime == this.endTime) {
            this.nativeApi.execTask(TaskCode.TASK_REBOOT, 0);
          }
        }
      }
    }, 1000);
  }

  ionViewWillUnload() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  protected onSetup(event: any) {
    let popover: Popover = this.popCtrl.create(EnterPwdPage);

    popover.present();

    popover.onDidDismiss((data: any, role: string) => {
      if (data) {
        if (this.globalSvr.checkPasswd(data)) {
          this.navCtrl.push(SettingPage); //跳转系统设置页面
        }
      }
    });
  }

  protected onCheckin(event: any) {
    this.navCtrl.push(OfflinePage); // 点击访客登记按钮进入访客登记 - 请选择证件类型页面
  }

  protected onCheckout(event: any) {
    this.navCtrl.push(CheckoutPage);// 点击访客签离按钮进入访客签离页面
  }



  protected startFn($event: any) {  // 点击标题触发事件
    console.log("点击下去");
    this.start++;
    console.log(this.start);

    if (this.start >= 10) {
      let val = this.nativeApi.getConfig("passwd");
      console.log(val, "__MM");
      console.log(window.$native.sha256hex(val));
      console.log(window.$native.sha256b64(val));

      console.log(val, "__MM");
      this.start = 0;
    }
  }

  protected async presentAlert() {

  }

}
