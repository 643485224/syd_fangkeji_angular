import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import {
  NativeApiProvider,
  TaskCode
} from "../../providers/native-api/native-api";
import { GlobalProvider } from "../../providers/global/global";
import { FullVisitorInfo, StaffInfo, VisitorInfo } from '../../providers/webapi/webapi';
import { IdCardInfo } from "../../providers/native-api/native-api";
import { sleep, getSexStr } from '../../app/common';
import { InfoData } from '../../app/models';

export class Params {
  /**
   * 1:   抓拍模式
   * 2:   人证模式
   */
  mode: number = 0;
  bitmap: string = "";
  offline?: boolean = false;
  visitorInfo?: VisitorInfo | FullVisitorInfo = null;
  staffInfo?: StaffInfo = null;
  idcard?: IdCardInfo = null;
}

@IonicPage({
  segment: "getface"
})
@Component({
  selector: "page-get-face",
  templateUrl: "get-face.html"
})
export class GetFacePage {
  protected blEnable: boolean = true;
  protected info: InfoData = new InfoData();
  private params: Params;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeApi: NativeApiProvider
  ) {
    this.params = this.navParams.data;
    this.init();
  }

  ionViewDidLoad() {
    this.blEnable = true;
  }

  private init() {
    if (!this.params) {
      if (this.globalSvr.offlineMode) {
        this.info.name = this.globalSvr.offline.visitor.name;
        this.info.sex = getSexStr(this.globalSvr.offline.visitor.sex);
        //this.info.credNum = this.globalSvr.offline.credNum;
        this.info.credNum = this.globalSvr.offline.visitor.credNum;
        this.info.reason = this.globalSvr.offline.visitor.reason;
        if(this.globalSvr.enable_visitor){
        this.info.isv_name = this.globalSvr.offline.staff.name;
        this.info.isv_deptName = this.globalSvr.offline.staff.company ? this.globalSvr.offline.staff.company : "";
        }else{
        this.info.isv_name = '无';
        this.info.isv_deptName ='无';
        }
      }
    } else {
      if (this.params && this.params.visitorInfo) {
        this.info.name = this.params.visitorInfo.v_name;
        this.info.sex = getSexStr(this.params.visitorInfo.v_sex);
        this.info.credNum = atob(this.params.visitorInfo.v_certificateNumber);
        this.info.reason = this.params.visitorInfo.v_reason;
        this.info.isv_name = this.params.visitorInfo.isv_name;
        this.info.isv_deptName = this.params.visitorInfo.isv_deptName;
      }

      if (this.params && this.params.staffInfo) {
        if (!this.info.isv_name) this.info.isv_name = this.params.staffInfo.name;
        if (!this.info.isv_deptName) this.info.isv_deptName = this.params.staffInfo.deptName;
      }

      if (this.params && this.params.offline) {
        this.info.name = this.globalSvr.offline.name;
        this.info.sex = this.globalSvr.offline.sex;
        //this.info.credNum = this.globalSvr.offline.credNum;
        this.info.credNum = this.globalSvr.offline.visitor.credNum;
        this.info.reason = this.globalSvr.offline.visitor.reason;
        if(this.globalSvr.enable_visitor){
        this.info.isv_name = this.globalSvr.offline.staff.name;
        this.info.isv_deptName = this.globalSvr.offline.staff.company ? this.globalSvr.offline.staff.company : "";
        }else{
          this.info.isv_name = '无';
          this.info.isv_deptName = '无';
        }
       
      }
    }
  }

  protected async onClick(event: any) {
    this.blEnable = false;

    try {
      await this.nativeApi.execTask(
        TaskCode.TASK_START_ACT_FACE,
        this.params.mode,
        this.params.bitmap,
        JSON.stringify(this.info)
      );
      await sleep(200);
    } catch (err) {
      console.error(err);
    } finally {
      this.blEnable = true;
    }

  }
}
