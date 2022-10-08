import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import {
  WebapiProvider,
  JsonResponse,
  VisitorList
} from "../../providers/webapi/webapi";
import { Appointment3Page } from "./appointment3";
import {
  NativeApiProvider,
  AndroidEvent,
  IdCardInfo
} from "../../providers/native-api/native-api";
import { Subscription } from "rxjs";
import { EventCode } from "../../providers/native-api/native-api";
import { sleep } from "../../app/common";
import { Appointment2Page } from './appointment2';
import { WebError } from '../../providers/webapi/webapi';

@IonicPage({
  segment: "appointment"
})
@Component({
  selector: "page-appointment",
  templateUrl: "appointment.html"
})
export class AppointmentPage {
  protected code: string = "";
  private subEvent: Subscription = null;
  private subIdcard: Subscription = null;
  private idcard: IdCardInfo = null;
  private time: number = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public webApiSvr: WebapiProvider,
    public nativeSvr: NativeApiProvider
  ) { }

  ionViewDidLoad() {//页面加载的时候触发，仅在页面创建的时候触发一次
    this.globalSvr.checkin.reset();
    this.idcard = null;
  }

  ionViewDidEnter() { //当进入页面时触发
    this.setHandler(); //调用setHandler方法
  }

  ionViewDidLeave() {//离开页面时触发
    this.idcard = null;
    this.code = "";
    this.cleanHandler();//调用cleanHandler方法
  }

  private setHandler() {
    this.subEvent = this.nativeSvr
      .subscribe_Event() // 调用事件接口
      .subscribe((event: AndroidEvent) => {
        if (!event) return;

        if (Date.now() - this.time < 2200) return;
        this.time = Date.now();

        switch (event.Code) {  // 如果存在event.Code执行里面代码
          case EventCode.EVENT_SCAN_CODE:   // EventCode为2
            {                  // 当event.Code结果为2时执行里面的代码
              let regexp: RegExp = new RegExp(/^\d{6}$/); // 表示只能输入6位数字的正则表达式

              if (regexp.test(event.Param1) === false) {
                this.globalSvr.showAlert("警告", "邀请二维码内容不合法!");
                return;
              }

              this.code = event.Param1;
              this.nextStep(1);
            }
            break;
        }
      });

    this.subIdcard = this.nativeSvr
      .subscribe_IdCard() // 调用订阅二代证接口
      .subscribe((info: IdCardInfo) => {
        if (!info) return;
        if (Date.now() - this.time < 2200) return;

        this.time = Date.now();

        this.nativeSvr.beep();
        this.idcard = info;

        let now = new Date();
        let nowNumber = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + (now.getDate());
        let expire = this.idcard.Expire;
        if (parseInt(expire) < nowNumber) {
          this.globalSvr.showAlert("警告", "身份证过期");
        }
        this.nextStep(2);
      });
  }

  private cleanHandler() {
    if (this.subEvent) {
      this.subEvent.unsubscribe();
      this.subEvent = null;
    }

    if (this.subIdcard) {
      this.subIdcard.unsubscribe();
      this.subIdcard = null;
    }
  }

  private async nextStep(mode: number) {
    let resp: JsonResponse;
    let list: VisitorList;

    try {
      switch (mode) {
        case 1:
          if (this.code.length !== 6) {
            this.globalSvr.showAlert("警告", "邀请码长度不足6位!");
            return;
          }

          this.globalSvr.showLoading("查询预约信息中...");
          this.globalSvr.checkin.mode = 1;
          this.globalSvr.checkin.idcard = null;
          this.globalSvr.checkin.regcode = this.code;
          resp = await this.webApiSvr.getVisitor(this.code);
          break;
        case 2:
          this.globalSvr.showLoading("查询预约信息中...");
          this.globalSvr.checkin.mode = 2;
          this.globalSvr.checkin.idcard = this.idcard;
          resp = await this.webApiSvr.getVisitor(
            null,
            "身份证",
            this.idcard.IdNo
          );
          break;
        default:
          return;
      }

      await sleep(580);
      this.globalSvr.hideLoading();

      if (!resp) {
        this.globalSvr.showAlert("警告", "查询预约信息失败,响应为空!");
        return;
      }

      if (resp.code !== 200) {
        let msg: string;
        msg = `查询预约信息失败:[${this.webApiSvr.getErrorMsg(resp.code)}]!`;

        this.globalSvr.showAlert(
          "警告",
          msg
        );
        return;
      }

      if (!resp.info) {
        this.globalSvr.showAlert("警告", "未查询到预约信息[-1]!");
        return;
      }

      list = resp.info;

      if (list.visitorList.length <= 0) {
        this.globalSvr.showAlert("警告", "未查询到预约信息!");
        return;
      }

      this.globalSvr.checkin.staff = null;

      // 选择记录
      if (list.visitorList.length > 1) {
        this.navCtrl.push(Appointment2Page, { // 跳转到预约来访 - 选择来访记录页面
          list: list.visitorList
        });

        return;
      }

      this.globalSvr.checkin.visitor = list.visitorList[0];

      if (this.globalSvr.checkin.visitor) {
        let tmp: string;

        tmp = this.globalSvr.checkin.visitor.v_certificateNumber;

        if (tmp) {
          console.debug("credNum301:", tmp);
          tmp = window.$native.aesDecrypt(tmp, this.webApiSvr.encKey);
          console.debug("credNum302:", tmp);
          this.globalSvr.checkin.visitor.v_certificateNumber = tmp;
        }
      }

      try {
        if (mode === 2 && this.globalSvr.checkin.visitor.inviteCode) {
          this.globalSvr.checkin.regcode = atob(this.globalSvr.checkin.visitor.inviteCode);
        }
      } catch (err) {
        console.error(err);
      }

      this.navCtrl.push(Appointment3Page, { // 跳转到预约来访 - 抓拍人脸页面
        params: {
          mode: mode,
          bitmap: mode === 2 ? this.idcard.Head : "",
          visitorInfo: this.globalSvr.checkin.visitor,
          staffInfo: this.globalSvr.checkin.staff,
          idcard: this.idcard
        }
      });
    } catch (err) {
      let errMsg: string;

      console.error(err);

      if (err instanceof WebError && err.textStatus === "timeout") {
        errMsg = `网络请求超时!`;
      } else {
        errMsg = `查询预约信息出错!`;
      }

      this.globalSvr.showAlert("警告", errMsg);
    } finally {
      this.globalSvr.hideLoading();
    }
  }

  protected onNumDown(char: string) {
    if (this.code.length < 6) {
      this.code += char;
    }
  }

  protected onBackspace() {
    if (this.code.length) {
      this.code = this.code.substring(0, this.code.length - 1);
    }
  }

  protected onClean() {
    this.code = "";
  }

  protected async onEnter(event: any) { // 点击确认按钮触发该方法
    this.nextStep(1);
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
