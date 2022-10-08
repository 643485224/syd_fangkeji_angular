import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  Popover,
  PopoverController
} from "ionic-angular";
import { SettingPage } from "../setting/setting";
import { EnterPwdPage } from "../enter-pwd/enter-pwd";
import { AppointmentPage } from "../appointment/appointment";
import { OnsitePage } from "../onsite/onsite";
import { CheckoutPage } from '../checkout/checkout';
import { GlobalProvider } from "../../providers/global/global";
import { WebapiProvider, JsonResponse } from '../../providers/webapi/webapi';
import * as Common from "../../app/common";
import {
  NativeApiProvider, TaskCode
} from "../../providers/native-api/native-api";
/**
 * 平台模式入口页面
 */
@IonicPage({
  segment: "entry-online"
})
@Component({
  selector: "page-entry-online",
  templateUrl: "entry-online.html"
})
export class EntryOnlinePage { // 首页
  private timer: number = null;
  protected text: string = "";
  protected stateIcon: string = "disconn";
  protected stateColor: string = "danger";
  protected btnEnable: boolean = false;
  protected Taskid: any;
  protected endTime: any;
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
      if (TaskArray) {
        for (let index = 0; index < TaskArray.length; index++) {
          this.Taskid = TaskArray[index].id;//获取星期几
          this.endTime = TaskArray[index].endTime;//自定义时间
          if (this.Taskid == today) {
            if (restartTime == this.endTime) {
              this.nativeApi.execTask(TaskCode.TASK_REBOOT, 0);
            }
          }
        }
      }


      this.btnEnable = true;
      this.stateIcon = "conn";
      this.stateColor = "secondary";
      if (this.webApiSvr.state === 1) {
        this.btnEnable = true;
        this.stateIcon = "conn";
        this.stateColor = "secondary";
      } else {
        this.btnEnable = false;
        this.stateIcon = "disconn";
        this.stateColor = "danger";
      }
    }, 1000);
  }


  ionViewWillEnter() { }

  ionViewWillUnload() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  protected async onConnClick() {
    if (this.webApiSvr.state !== 1) {
      let resp: JsonResponse;

      try {
        resp = await this.webApiSvr.unregister();
        console.log("unregister:", resp);
      } catch (err) {
        console.log("错误");
        console.error(err);
      }
    }
  }

  protected onSetup(event: any) {
    let popover: Popover = this.popCtrl.create(EnterPwdPage);

    popover.present();

    popover.onDidDismiss((data: any, role: string) => {
      if (data) {
        if (this.globalSvr.checkPasswd(data)) {
          this.navCtrl.push(SettingPage); // 跳转到系统设置页面
        }
      }
    });
  }

  protected onAppointment(event: any) {
    this.navCtrl.push(AppointmentPage); // 点击预约登记按钮进入预约来访页面
  }

  protected onSite(event: any) {
    this.navCtrl.push(OnsitePage);// 点击现场登记按钮进入现场登记页面
  }

  protected onCheckout(event: any) {
    this.navCtrl.push(CheckoutPage);// 点击访客签离按钮进入访客签离页面
  }
}
