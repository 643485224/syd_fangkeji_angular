import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import { getSexNum, formatNormal } from "../../app/common";
import { WebError } from '../../providers/webapi/webapi';
import {
  NativeApiProvider,
  PrintRequest,
  OcrIdcardInfo,
  TaskResult
} from "../../providers/native-api/native-api";
import {
  WebapiProvider,
  FullVisitorInfo,
  JsonResponse,
  VisitorInfo
} from "../../providers/webapi/webapi";

@Component({
  selector: "page-onsite5",
  templateUrl: "onsite5.html"
})
export class Onsite5Page {  // 登记 - 打印凭条页面
  protected step = 1;
  protected count: number = 4;
  protected errorText: string = "";
  private timer: number = null;
  private timer2: number = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public webApiSvr: WebapiProvider,
    public nativeSvr: NativeApiProvider
  ) { }

  ionViewDidLoad() {
    this.proc();
  }

  ionViewDidLeave() { //离开页面时清空定时器
    if (this.timer) window.clearInterval(this.timer);
    if (this.timer2) window.clearInterval(this.timer2);
  }

  private createTimer() {
    this.count = 4;
    this.timer = window.setInterval(() => {
      this.count--;

      if (this.count <= 0) {
        this.step = 3;
        window.clearInterval(this.timer);
        this.timer = null;
        this.createEndTimer();
      }
    }, 1000);
  }

  private createEndTimer() {
    this.count = 4;
    this.timer2 = window.setInterval(() => {
      this.count--;

      if (this.count <= 0) {
        window.clearInterval(this.timer2);
        this.timer2 = null;
        this.navCtrl.popToRoot();
      }
    }, 1000);
  }

  private async print(code: string) {
    let request: PrintRequest = new PrintRequest();
    let result: TaskResult;

    request.Title = "访客登记单";
    request.Name = this.globalSvr.onsite.name;  // 姓名
    request.Sex = this.globalSvr.onsite.sex;  // 性别

    if (this.globalSvr.onsite.idcard) {
      //request.Bitmap = this.globalSvr.onsite.idcard.Head;
      //request.Folk = this.globalSvr.onsite.idcard.Folk;
      //request.CardNum = this.globalSvr.onsite.idcard.IdNo;
    }

    request.Bitmap2 = this.globalSvr.onsite.b64picture;

    if (this.globalSvr.onsite.visitor) {
      request.Reason = this.globalSvr.onsite.visitor.v_reason;
      request.Time = this.globalSvr.onsite.visitor.v_time;
      request.Interviewee = this.globalSvr.onsite.visitor.isv_name;
      request.Department = this.globalSvr.onsite.visitor.isv_deptName;
      request.Company = this.globalSvr.onsite.visitor.v_dw;
      request.Mobile = this.globalSvr.onsite.visitor.v_phone;

      if (this.globalSvr.onsite.visitor.v_certificateNumber) {
        let tmp: string;

        tmp = this.globalSvr.onsite.visitor.v_certificateNumber;
        console.debug("credNum201:", tmp);
        tmp = window.$native.aesDecrypt(tmp, this.webApiSvr.encKey);
        console.debug("credNum201-1:", tmp);
        tmp = atob(tmp);
        console.debug("credNum202-2:", tmp);
        request.CardNum = tmp;
      }


    }

    if (this.globalSvr.onsite.staff) {  // 被访人
      if (this.globalSvr.onsite.staff.name)
        request.Interviewee = this.globalSvr.onsite.staff.name;
    } else {
      request.Interviewee = '无';
    }

    if (this.globalSvr.onsite.visitor.inviteCode) { // 邀请码
      request.RegCode = atob(this.globalSvr.onsite.visitor.inviteCode);
    }

    if (!request.Time) {
      request.Time = formatNormal(new Date());
    }

    //// request.Code = atob(code);
    request.Code = code;

    try {
      result = await this.nativeSvr.printForm(request);

      if (!result) {
        this.globalSvr.showAlert("提示", `打印机未响应!`)
      } else if (result.Result !== 0) {
        this.globalSvr.showAlert("错误", `打印凭条失败, 打印机故障或缺纸[${result.Result}]!`)
      }
    } catch (err) {
      console.error(err);
      if (err === 'timeout') {
        this.globalSvr.showAlert("提示", `打印超时!`)
      }
    }
  }

  private async proc() {
    let info: VisitorInfo;
    let resp: JsonResponse;

    info = this.globalSvr.onsite.visitor;

    if (!info) {
      this.errorText = "访客信息不存在!";
      this.step = 10;
      return;
    }
    if (this.globalSvr.enable_visitor) {
      if (!this.globalSvr.onsite.staff) {
        this.errorText = "被访人信息不存在!";
        this.step = 10;
        return;
      }
    }

    //this.globalSvr.showLoading("正在提交信息中");

    // 证件模式
    try {
      if (this.globalSvr.onsite.staff) {
        info.isv_id = this.globalSvr.onsite.staff.id;
      } else {
        info.isv_id = 0;
      }

      info.v_certificatePic =
        info.v_certificatePic || this.globalSvr.onsite.b64cred;
      info.v_capturePic = info.v_capturePic || this.globalSvr.onsite.b64picture;

      resp = await this.webApiSvr.addVisitor(info);
      //this.globalSvr.hideLoading();

      if (!resp) {
        this.errorText = "提交登记信息失败,响应为空!";
        this.step = 10;
        return;
      }

      if (resp.code !== 200) {
        switch (resp.code) {
          case 608:
            this.errorText = `用户已登记,请勿重复登记!`;
            this.step = 10;
            break;
          default:
            this.errorText = `提交登记信息失败:[${this.webApiSvr.getErrorMsg(resp.code)}]`;
            this.step = 10;
            break;
        }

        return;
      }

      if (this.globalSvr.enable_print) {
        this.step = 2;
        this.createTimer();

        window.setTimeout(() => {
          this.print(resp.info.code);
        }, 200);
      } else {
        this.step = 3;
        this.createEndTimer();
      }
    } catch (err) {
      this.step = 10;
      console.error(err);

      if (err instanceof WebError && err.textStatus === "timeout") {
        this.errorText = `网络请求超时!`;
      } else {
        this.errorText = `提交登记信息时出现错误!`;
      }
    } finally {
      //this.globalSvr.hideLoading();
    }
  }

  protected onGoBack() {
    this.navCtrl.popToRoot();
  }
}
