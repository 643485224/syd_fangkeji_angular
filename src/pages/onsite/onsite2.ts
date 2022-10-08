import { ListItem } from './../../app/models';
import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import { VisitorInfo } from "../../providers/webapi/webapi";
import { Onsite3Page } from "./onsite3";
import { Onsite4Page } from "./onsite4";
import { Subscription } from "rxjs";
import {
  NativeApiProvider,
  AndroidEvent,
  EventCode,
  OcrIdcardInfo,
  OcrPpInfo,
  ReadPpInfo
} from "../../providers/native-api/native-api";
import { getSexNum } from "../../app/common";
import { OcrDrivingCardInfo } from "../../providers/native-api/native-api";
import { listFolks } from '../../app/models';

@Component({
  selector: "page-onsite2",
  templateUrl: "onsite2.html"
})
export class Onsite2Page {  // 确认访客信息页面
  protected readonly listFolks: ListItem[] = listFolks;
  private subEvent: Subscription = null;

  protected strName: string = "";
  protected numSex: number = 0;
  protected strFolk: string = "";
  protected strCredNum: string = "";
  protected strPhone: string = "";
  protected strReason: string = "浏览参观";
  // protected straging: string = "12小时";
  protected strPlateNum: string = "";
  protected strCompany: string = "";
  protected temperature: string = "";
  private time: number = 0;
  constructor(
    public nativeSvr: NativeApiProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider
  ) { }
  ionViewWillUnload() {
    this.cleanHandler();
  }
  private cleanHandler() {
    if (this.subEvent) {
      this.subEvent.unsubscribe();
      this.subEvent = null;
    }
  }
  ionViewDidLoad() {
    if (this.globalSvr.field_company === false) {
      this.strCompany = "无";
    }
    if (this.globalSvr.field_phone === false) {
      this.strPhone = " ";
    }
    this.setHandler();
    this.processField();
  }

  private processField() {
    this.globalSvr.onsite.visitor = new VisitorInfo();

    switch (this.globalSvr.onsite.mode) {
      //OCR身份证
      case 1:
        {
          let info: OcrIdcardInfo;

          info = this.globalSvr.onsite.cardInfo;

          if (info) {
            this.globalSvr.onsite.visitor.v_certificatePic = this.globalSvr.onsite.b64cred;
            this.globalSvr.onsite.visitor.v_certificateType = "OCR身份证";
            this.globalSvr.onsite.visitor.v_name = info.Name;
            this.globalSvr.onsite.visitor.v_sex = getSexNum(info.Sex);
            this.globalSvr.onsite.visitor.v_certificateNumber = btoa(info.Num);
            this.globalSvr.onsite.visitor.v_nation = info.Folk;
            this.globalSvr.onsite.visitor.v_address = info.Addr;
          }
        }
        break;
      //OCR护照
      case 2:
        {
          let info: OcrPpInfo;
          info = this.globalSvr.onsite.cardInfo;

          if (info) {
            this.globalSvr.onsite.visitor.v_certificatePic = this.globalSvr.onsite.b64cred;
            this.globalSvr.onsite.visitor.v_certificateType = "OCR护照";
            this.globalSvr.onsite.visitor.v_name = info.NameCh || info.Name;
            this.globalSvr.onsite.visitor.v_sex = getSexNum(info.SexCH || info.Sex);
            this.globalSvr.onsite.visitor.v_certificateNumber = btoa(
              info.CardNo
            );
            this.globalSvr.onsite.visitor.v_address = info.AddressCH;
          }
        }
        break;
      //OCR驾照
      case 3:
        {
          let info: OcrDrivingCardInfo;
          info = this.globalSvr.onsite.cardInfo;

          if (info) {
            this.globalSvr.onsite.visitor.v_certificatePic = this.globalSvr.onsite.b64cred;
            this.globalSvr.onsite.visitor.v_certificateType = "OCR护照";
            this.globalSvr.onsite.visitor.v_name = info.Name;
            this.globalSvr.onsite.visitor.v_sex = getSexNum(info.Sex);
            this.globalSvr.onsite.visitor.v_certificateNumber = btoa(
              info.CardNo
            );
            this.globalSvr.onsite.visitor.v_address = info.Address;
          }
        }
        break;
      //读取身份证
      case 4:
        {
          if (this.globalSvr.onsite.idcard) {
            this.globalSvr.onsite.visitor.v_name = this.globalSvr.onsite.idcard.Name;
            this.globalSvr.onsite.visitor.v_sex = getSexNum(
              this.globalSvr.onsite.idcard.Sex
            );
            this.globalSvr.onsite.visitor.v_nation = this.globalSvr.onsite.idcard.Folk;
            this.globalSvr.onsite.visitor.v_address = this.globalSvr.onsite.idcard.Address;
            this.globalSvr.onsite.visitor.v_certificateNumber = btoa(
              this.globalSvr.onsite.idcard.IdNo
            );
            this.globalSvr.onsite.visitor.v_certificateType = "身份证";
            this.globalSvr.onsite.visitor.v_certificateUnit = this.globalSvr.onsite.idcard.Department;
            this.globalSvr.onsite.visitor.v_certificateHead = this.globalSvr.onsite.idcard.Head;
            this.globalSvr.onsite.visitor.uid = this.globalSvr.onsite.idcard.Uid;
          }
        }
        break;
      //读取电子护照
      case 5:
        {
          let info: OcrPpInfo;
          let info2: ReadPpInfo;

          info = this.globalSvr.onsite.cardInfo;
          info2 = this.globalSvr.onsite.cardInfo2;

          if (info && info2) {
            this.globalSvr.onsite.visitor.v_certificatePic = this.globalSvr.onsite.b64cred;
            this.globalSvr.onsite.visitor.v_certificateType = "护照";
            this.globalSvr.onsite.visitor.v_name =
              info2.DG11_LocalName || info.NameCh;
            this.globalSvr.onsite.visitor.v_sex = getSexNum(
              info2.DG1_Sex || info.SexCH
            );
            this.globalSvr.onsite.visitor.v_certificateNumber = btoa(
              info2.DG1_Number || info.CardNo
            );
            this.globalSvr.onsite.visitor.v_address =
              info2.DG11_Addr || info.AddressCH;
          }
        }
        break;
      case 6: {
        //姓名，性别，证件号码，手机号，来访事由，车牌号码  访客单位
        this.globalSvr.onsite.visitor.v_name = this.strName;
        this.globalSvr.onsite.visitor.v_sex = getSexNum(this.numSex.toString());
        this.globalSvr.onsite.visitor.v_cardNumber = this.strCredNum;
        this.globalSvr.onsite.visitor.v_phone = this.strPhone;
        this.globalSvr.onsite.visitor.v_reason = this.strReason
        // this.globalSvr.onsite.visitor.v_aging = this.straging
        this.globalSvr.onsite.visitor.v_plateNumber = this.strPlateNum
        this.globalSvr.onsite.visitor.v_dw = this.strCompany;
      }
        break;
    }

    this.strName = this.globalSvr.onsite.visitor.v_name;
    this.numSex = this.globalSvr.onsite.visitor.v_sex;
    this.strFolk = this.globalSvr.onsite.visitor.v_nation || this.listFolks[0].name;
    this.strCredNum = atob(this.globalSvr.onsite.visitor.v_certificateNumber);
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
              } 
            }
            break;
        }
      });
  }
  
  protected detect(event: any) {
     this.nativeSvr.GetTemperature().then(res => {
      this.temperature  = res;
    });
  }
  protected onOK(event: any) {
    if (!this.strName) {
      this.globalSvr.showAlert("警告", "姓名不能为空!");
      return;
    }

    if (this.numSex === 0) {
      this.globalSvr.showAlert("警告", "性别不能未知!");
      return;
    }

    if (!this.strCredNum) {
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
    if (this.globalSvr.enable_temperature && !this.temperature) {
      this.globalSvr.showAlert("警告", "请检测温度!");
      return;
    }
    // if (this.globalSvr.field_aging) {
    //   if (!this.straging) {
    //     this.globalSvr.showAlert("警告", "来访时效不能为空!");
    //     return;
    //   }
    // }
    if (this.strName) {  // 姓名
      this.globalSvr.onsite.visitor.v_name = this.strName;
    } else {
      this.globalSvr.showAlert("警告", "姓名不能为空!");
      return;
    }

    this.globalSvr.onsite.visitor.v_sex = <any>this.numSex; // 性别(1:男 2:女)

    if (this.strFolk) {  // 民族
      this.globalSvr.onsite.visitor.v_nation = this.strFolk;
    }

    if (this.strCredNum) { // 证件号码
      this.globalSvr.onsite.visitor.v_certificateNumber = btoa(this.strCredNum);
    }

    if (this.strPhone) { // 手机号码
      this.globalSvr.onsite.visitor.v_phone = this.strPhone;
    } else {
      this.globalSvr.onsite.visitor.v_phone = ' '
    }

    if (this.strReason) { // 来访事由
      this.globalSvr.onsite.visitor.v_reason = this.strReason;
    }

    if (this.strPlateNum) { // 车牌号码
      this.globalSvr.onsite.visitor.v_plateNumber = this.strPlateNum || '无';
    }

    if (this.strCompany) { // 访客单位
      this.globalSvr.onsite.visitor.v_dw = this.strCompany;
    } else {
      this.globalSvr.onsite.visitor.v_dw = '无'
    }
    // if (this.straging) { // 来访时效
    //   this.globalSvr.onsite.visitor.v_aging = this.straging;
    // }
    let mode: number = 1;
    if (this.globalSvr.onsite.b64head) mode = 2;

    if (this.globalSvr.enable_visitor) {
      this.navCtrl.push(Onsite3Page); //跳转现场登记 - 选择被访人页面
    } else {
      this.navCtrl.push(Onsite4Page, {  //跳转现场登记 - 抓拍人脸页面
        params: {
          mode: mode,
          bitmap: this.globalSvr.onsite.b64head,
          offline: false,
          visitorInfo: this.globalSvr.onsite.visitor,
          staffInfo: '',
          idcard: this.globalSvr.onsite.idcard
        }
      })
    }
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
