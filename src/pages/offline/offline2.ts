import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import * as Common from "../../app/common";
import { VisitorInfo } from "../../providers/webapi/webapi";
import { Offline4Page } from "./offline4";
import { Offline3Page } from "./offline3";
import { OcrIdcardInfo ,
  NativeApiProvider,
  AndroidEvent,
  EventCode,
} from "../../providers/native-api/native-api";
import { getSexNumEx } from "../../app/common";
import { Subscription } from "rxjs";
@Component({
  selector: "page-offline2",
  templateUrl: "offline2.html"
})
export class Offline2Page { // 确认访客信息页面
  protected strName: string = "";
  protected numSex: number = 0;
  protected strCardNum: string = "";
  protected strPhone: string = "";
  protected strReason: string = "浏览参观";
  protected strPlateNum: string = "";
  protected strCompany: string = "";
  private subEvent: Subscription = null;
  private time: number = 0;
  protected temperature: string = "";
  constructor(
    public nativeSvr: NativeApiProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider
  ) { }

  ionViewDidLoad() {
    this.processField();
    this.setHandler();
  }
  ionViewWillUnload() {
    this.cleanHandler();
  }
  private cleanHandler() {
    if (this.subEvent) {
      this.subEvent.unsubscribe();
      this.subEvent = null;
    }
  }
  protected detect(event: any) {
    this.nativeSvr.GetTemperature().then(res => {
     this.temperature  = res;
   });
 }
  private setHandler() {
    this.subEvent = this.nativeSvr
      .subscribe_Event()  // 调用事件接口
      .subscribe((event: AndroidEvent) => {
        if (!event) return;

        if (Date.now() - this.time < 1200) return;
        this.time = Date.now();

        switch (event.Code) {
          case EventCode.EVENT_SCAN_TEMPERATURE_MEASUREMENT:   // EventCode为4
            {
              let code: string = event.Param1.trim();
              
              if (code) {
                this.temperature = code
                console.log("code: "+ code);
                
              } 
            }
            break;
        }
      });
  }

  private optString(obj: any, field: string): string {
    if (!obj) return "";
    if (field in obj) return obj[field];
    return "";
  }

  private processField() {
    switch (this.globalSvr.offline.mode) {
      //OCR身份证
      case 1:
        this.strName = this.optString(this.globalSvr.offline.cardInfo, "Name");
        this.numSex = getSexNumEx(this.globalSvr.offline.cardInfo, "Sex");
        this.strCardNum = this.optString(
          this.globalSvr.offline.cardInfo,
          "Num"
        );
        break;
      //OCR护照
      case 2:
        this.strName = this.optString(
          this.globalSvr.offline.cardInfo,
          "NameCh"
        );

        if (!this.strName) {
          this.strName = this.optString(
            this.globalSvr.offline.cardInfo,
            "Name"
          );
        }

        this.numSex = getSexNumEx(this.globalSvr.offline.cardInfo, "Sex");
        this.strCardNum = this.optString(
          this.globalSvr.offline.cardInfo,
          "CardNo"
        );
        break;
      //OCR驾驶证
      case 3:
        this.strName = this.optString(this.globalSvr.offline.cardInfo, "Name");
        this.numSex = getSexNumEx(this.globalSvr.offline.cardInfo, "Sex");
        this.strCardNum = this.optString(
          this.globalSvr.offline.cardInfo,
          "CardNo"
        );
        break;
      //二代证
      case 4:
        this.strName = this.globalSvr.offline.idcard.Name;
        this.numSex = getSexNumEx(this.globalSvr.offline.idcard, "Sex");
        this.strCardNum = this.globalSvr.offline.idcard.IdNo;
        break;
      //电子护照
      case 5:
        this.strName = this.optString(
          this.globalSvr.offline.cardInfo2,
          "DG11_LocalName"
        );
        this.numSex = getSexNumEx(this.globalSvr.offline.cardInfo2, "DG1_Sex");
        this.strCardNum = this.optString(
          this.globalSvr.offline.cardInfo2,
          "DG1_Number"
        );
        break;
    }
  }

  protected onOK(event: any) {  // 点击下一步按钮
    if (!this.strName) {
      this.globalSvr.showAlert("警告", "姓名不能为空!");
      return;
    }

    if (this.numSex === 0) {
      this.globalSvr.showAlert("警告", "性别不能未知!");
      return;
    }

    if (!this.strCardNum) {
      this.globalSvr.showAlert("警告", "证件号不能为空!");
      return;
    }

    if (this.globalSvr.field_phone) {
      if (this.strPhone.length < 11) {
        this.globalSvr.showAlert("警告", "访客手机号码长度不合法!");
        return;
      }
    }

    if (this.globalSvr.field_reason) {
      if (!this.strReason) {
        this.globalSvr.showAlert("警告", "来访事由不能为空!");
        return;
      }
    }
    if (this.globalSvr.field_platenum) {
      if (!this.strPlateNum) {
        this.globalSvr.showAlert("警告", "车牌号码不能为空!");
        return;
      }
    }
    if (this.globalSvr.field_company) {
      if (!this.strCompany) {
        this.globalSvr.showAlert("警告", "访客单位不能为空!");
        return;
      }
    }

    if (this.strName) { // 姓名
      this.globalSvr.offline.visitor.name = this.strName;
    }

    this.globalSvr.offline.visitor.sex = <any>this.numSex; //性别(1:男 2：女)

    if (this.strCardNum) {// 证件号码
      this.globalSvr.offline.visitor.credNum = this.strCardNum;
    }

    if (this.strPhone) {// 手机号码
      this.globalSvr.offline.visitor.mobile = this.strPhone;
    }

    if (this.strReason) {// 来访事由
      this.globalSvr.offline.visitor.reason = this.strReason;
    }

    if (this.strPlateNum) { // 车牌号码
      this.globalSvr.offline.visitor.plateNum = this.strPlateNum || '无';
    }

    if (this.strCompany) { // 访客单位
      this.globalSvr.offline.visitor.company = this.strCompany || '无';
    }
    console.log('this.globalSvr.enable_visitor', this.globalSvr.enable_visitor)
    if (this.globalSvr.enable_visitor) {
      this.navCtrl.push(Offline3Page);    // 跳转选择被访人页面
    } else {
      this.navCtrl.push(Offline4Page);    //否者跳转抓拍人脸页面
    }
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
