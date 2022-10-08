import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { TRecord } from "../../entities/trecord";
import { getSexStr, formatChsText } from "../../app/common";
import { TCredential } from "../../entities/tcredential";
import { DataAccessLayerProvider } from "../../providers/data-access-layer/data-access-layer";
import { TStaff } from "../../entities/tstaff";
import { GlobalProvider } from "../../providers/global/global";
import {
  TaskResult,
  NativeApiProvider,
  TaskCode
} from "../../providers/native-api/native-api";

@IonicPage({
  segment: "details"
})
@Component({
  selector: "page-details",
  templateUrl: "details.html"
})
export class DetailsPage {
  protected record: TRecord = null;
  protected strBmpHead: string = null;
  protected strBmpCred: string = null;
  protected strBmpSite: string = null;
  protected v_name: string = "";
  protected v_sex: string = "未知";
  protected v_folk: string = "";
  protected v_mobile: string = "";
  protected v_addr: string = "";
  protected s_name: string = "";
  protected s_sex: string = "";
  protected s_jobNum: string = "";
  protected s_mobile: string = "";
  protected s_company: string = "";
  protected s_dept: string = "";
  protected state: string = "";
  protected reason: string = "";
  protected plateNum: string = "";
  protected visit_time: string = "";
  protected leave_time: string = "";
  protected credType: string = "";
  protected credNum: string = "";
  private timer: number = null;
  private v_company:string = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeSvr: NativeApiProvider,
    public dal: DataAccessLayerProvider
  ) {
    this.record = this.navParams.data as TRecord;
  }

  ionViewDidLoad() {
    this.updateInfo();
  }

  private createTimer() {
    if (this.timer) return;

    this.timer = window.setInterval(() => {
      if (this.timer && this.globalSvr.checkTimeout()) {
        this.navCtrl.popToRoot();
        this.cleanTimer();
      }
    }, 1000);
  }

  private cleanTimer() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  ionViewDidEnter() {
    this.createTimer();
  }

  ionViewDidLeave() {
    this.cleanTimer();
  }

  private async updateInfo() {
    try {
      let result: TaskResult;
      let cred: TCredential | number;
      let staff: TStaff | number;

      if (this.record) {
        if (this.record.v_name) this.v_name = this.record.v_name;
        if (this.record.v_sex) this.v_sex = getSexStr(this.record.v_sex);
        if (this.record.v_folk) this.v_folk = this.record.v_folk;
        if (this.record.v_mobile) this.v_mobile = this.record.v_mobile;
        if (this.record.s_name) this.s_name = this.record.s_name;
        if (this.record.s_jobNum) this.s_jobNum = this.record.s_jobNum;
        if (this.record.VisitTime)
          this.visit_time = formatChsText(this.record.VisitTime);
        if (this.record.LeaveTime)
          this.leave_time = formatChsText(this.record.LeaveTime);

        if(this.record.v_company)
            this.v_company = this.record.v_company

        this.reason = this.record.reason;
        this.plateNum = this.record.plateNum;

        switch (this.record.state) {
          case 1:
            this.state = "在访中";
            break;
          case 2:
            this.state = "已签离";
            break;
          default:
            this.state = `未知:${this.record.state}`;
            break;
        }

        if (this.record.id_credential) {
          cred = await this.dal.queryOne(TCredential, {
            id: this.record.id_credential
          });
        }

        if (this.record.id_staff) {
          staff = await this.dal.queryOne(TStaff, {
            id: this.record.id_staff
          });
        }

        if (cred && typeof cred === "object") {
          this.v_addr = cred.address;

          switch (cred.type) {
            case 1:
              this.credType = "OCR身份证";
              break;
            case 2:
              this.credType = "OCR护照";
              break;
            case 3:
              this.credType = "OCR驾驶证";
              break;
            case 4:
              this.credType = "电子身份证";
              break;
            case 5:
              this.credType = "电子护照";
              break;
            default:
              this.credType = `未知:${cred.type}`;
              break;
          }

          this.credNum = cred.credNumber;
        }

        if (staff && typeof staff === "object") {
          this.s_sex = getSexStr(staff.sex);
          this.s_mobile = staff.mobile;
          this.s_company = staff.company;
          this.s_dept = staff.department;
        }

        if (this.record.pathBmpHead) {
          result = await this.nativeSvr.execTask(
            TaskCode.TASK_LOAD_PICTURE,
            0,
            this.record.pathBmpHead
          );

          if (result && result.Result === 0 && result.Payload) {
            this.strBmpHead = `data:image/jpeg;base64,${result.Payload}`;
          }
        }

        if (this.record.pathBmpCred) {
          result = await this.nativeSvr.execTask(
            TaskCode.TASK_LOAD_PICTURE,
            0,
            this.record.pathBmpCred
          );

          if (result && result.Result === 0 && result.Payload) {
            this.strBmpCred = `data:image/jpeg;base64,${result.Payload}`;
          }
        }

        if (this.record.pathBmpSite) {
          result = await this.nativeSvr.execTask(
            TaskCode.TASK_LOAD_PICTURE,
            0,
            this.record.pathBmpSite
          );

          if (result && result.Result === 0 && result.Payload) {
            this.strBmpSite = `data:image/jpeg;base64,${result.Payload}`;
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
}
