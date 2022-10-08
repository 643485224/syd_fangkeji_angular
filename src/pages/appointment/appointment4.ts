import { Component } from "@angular/core";
import { NavController, NavParams, Thumbnail } from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import { formatNormal } from "../../app/common";
import { TaskResult } from '../../providers/native-api/native-api';
import { WebError } from '../../providers/webapi/webapi';
import {
  PrintRequest,
  NativeApiProvider
} from "../../providers/native-api/native-api";
import {
  WebapiProvider,
  FullVisitorInfo,
  JsonResponse
} from "../../providers/webapi/webapi";

@Component({
  selector: "page-appointment4",
  templateUrl: "appointment4.html"
})
export class Appointment4Page {
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

  ionViewDidLoad() {// 页面加载的时候触发，仅在页面创建的时候触发一次
    this.proc();  // 调用proc方法
  }

  ionViewDidLeave() {//离开页面时触发
    if (this.timer) window.clearInterval(this.timer);//清空定时器
    if (this.timer2) window.clearInterval(this.timer2);//清空定时器
  }

  private createTimer() {
    this.count = 4;
    this.timer = window.setInterval(() => {
      this.count--;

      if (this.count <= 0) {
        this.step = 3;
        window.clearInterval(this.timer);//如果this.count <= 0 清空定时器
        this.timer = null;
        this.createEndTimer();// 如果this.count <= 0 调用createEndTimer方法
      }
    }, 1000);
  }

  private createEndTimer() {
    this.count = 4;
    this.timer2 = window.setInterval(() => {
      this.count--;

      if (this.count <= 0) {
        window.clearInterval(this.timer2);// 如果this.count <= 0 清空定时器
        this.timer2 = null;
        this.navCtrl.popToRoot();
      }
    }, 1000);
  }

  private async print(code: string) {
    let request: PrintRequest = new PrintRequest();
    let result: TaskResult;

    request.Title = "访客登记单";
    request.Name = this.globalSvr.checkin.name; // 姓名
    request.Sex = this.globalSvr.checkin.sex;  // 性别

    if (this.globalSvr.checkin.idcard) {
      //request.Bitmap = this.globalSvr.checkin.idcard.Head;
      //request.Folk = this.globalSvr.checkin.idcard.Folk;
      //request.CardNum = this.globalSvr.checkin.idcard.IdNo;
    }

    request.Bitmap2 = this.globalSvr.checkin.b64picture; // 头像

    if (this.globalSvr.checkin.visitor) {
      request.Reason = this.globalSvr.checkin.visitor.v_reason;
      request.Time = this.globalSvr.checkin.visitor.v_time;
      request.Interviewee = this.globalSvr.checkin.visitor.isv_name;
      request.Department = this.globalSvr.checkin.visitor.isv_deptName;
      request.Company = this.globalSvr.checkin.visitor.v_dw;
      request.Mobile = this.globalSvr.checkin.visitor.v_phone;

      if (this.globalSvr.checkin.visitor.v_certificateNumber) {
        let tmp: string;

        console.debug("credNum101:", this.globalSvr.checkin.visitor.v_certificateNumber);
        tmp = this.globalSvr.checkin.visitor.v_certificateNumber;
        tmp = window.$native.aesDecrypt(tmp, this.webApiSvr.encKey);
        console.debug("credNum101-1:", tmp);
        tmp = atob(tmp);
        console.debug("credNum101-2:", tmp);
        // if(this.globalSvr.checkin.mode !== 2){
        //   // tmp = atob(tmp);
        //   tmp = window.$native.aesDecrypt(tmp, this.webApiSvr.encKey);
        //   console.debug("credNum102-1:", tmp);
        // }else{
        //   tmp = atob(tmp);
        //   console.debug("credNum102-2:", tmp);
        // }
        request.CardNum = tmp;
      }
    }

    if (!request.Time) {
      request.Time = formatNormal(new Date());
    }

    if (this.globalSvr.checkin.regcode) {
      request.RegCode = this.globalSvr.checkin.regcode;
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
    let info: FullVisitorInfo;
    let resp: JsonResponse;

    info = this.globalSvr.checkin.visitor;

    if (!info) {
      this.errorText = "访客信息不存在!";
      this.step = 10;
      return;
    }

    // 证件模式
    try {
      if (this.globalSvr.checkin.mode === 2) {
        console.debug("credNum100:", "证件模式");
        info.v_sex = this.globalSvr.checkin.idcard.Sex === "男" ? 1 : 2;
        info.v_nation = this.globalSvr.checkin.idcard.Folk;
        info.v_certificateType = "身份证";
        info.v_certificateNumber = btoa(this.globalSvr.checkin.idcard.IdNo);
        console.debug("credNum100-1:", info.v_certificateNumber);
        info.v_certificateHead = this.globalSvr.checkin.idcard.Head;
        info.v_certificateUnit = this.globalSvr.checkin.idcard.Department;
        info.v_address = this.globalSvr.checkin.idcard.Address;
        info.uid = this.globalSvr.checkin.idcard.Uid;
      }

      info.v_capturePic = this.globalSvr.checkin.b64picture;

      resp = await this.webApiSvr.updateVisitor(info);

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
            this.errorText = `提交登记信息失败[${this.webApiSvr.getErrorMsg(resp.code)}]`;
            this.step = 10;
            break;
        }

        return;
      }

      if (this.globalSvr.enable_print) { // 如果this.globalSvr里面有
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
    }
  }

  protected onGoBack() {
    this.navCtrl.popToRoot();  // 点击返回首页按钮触发该事件
  }
}
