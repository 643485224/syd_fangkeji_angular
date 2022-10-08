import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Subscription } from "rxjs";
import {
  NativeApiProvider,
  IdCardInfo,
  AndroidEvent,
  EventCode
} from "../../providers/native-api/native-api";
import { GlobalProvider } from "../../providers/global/global";
import { WebapiProvider, JsonResponse, WebError } from '../../providers/webapi/webapi';
import { TRecord } from "../../entities/trecord";
import { DataAccessLayerProvider } from "../../providers/data-access-layer/data-access-layer";

@IonicPage({
  segment: "checkout"
})
@Component({
  selector: "page-checkout",
  templateUrl: "checkout.html"
})
export class CheckoutPage { //访客签离页面
  private subEvent: Subscription = null;
  private subIdcard: Subscription = null;
  private idcard: IdCardInfo = null;
  private time: number = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeSvr: NativeApiProvider,
    public webApiSvr: WebapiProvider,
    public dal: DataAccessLayerProvider
  ) { }

  ionViewDidLoad() {
    this.setHandler();
  }

  ionViewWillUnload() {
    this.idcard = null;
    this.cleanHandler();
  }

  /**
   * 脱机签离
   * @param code
   * @param credNum
   */
  private async checkoutOffline(code?: string, credNum?: string) {
    try {
      let record: TRecord | number;

      if (code) {
        record = await this.dal.queryOne(
          TRecord,
          {
            barcode: code,
            state: 1
          },
          { id: "DESC" }
        );
      } else if (credNum) {
        record = await this.dal.queryOne(
          TRecord,
          {
            credNumber: credNum,
            state: 1
          },
          { id: "DESC" }
        );
      } else {
        this.globalSvr.showAlert("提示", "查询字段不合法!");
        return;
      }

      if (typeof record === "number") {
        this.globalSvr.showAlert("提示", "查询访客记录失败!");
        return;
      }

      if (!record) {
        this.globalSvr.showAlert("提示", "未查询到有效来访记录!");
        return;
      }

      record.state = 2;
      record.leaveTime = Date.now();

      await this.dal.save(TRecord, record);
      await this.globalSvr.showAlert("提示", `访客[${record.v_name}]签离成功!`);
      this.navCtrl.pop();
    } catch (err) {
      console.error(err);
      this.globalSvr.showAlert("提示", "签离出错!");
    }
  }

  /**
   * 在线签离
   * @param code
   * @param inviteCode
   * @param credNum
   */
  private async checkoutOnline(
    code?: string,
    inviteCode?: string,
    credNum?: string
  ) {
    let resp: JsonResponse = null;

    try {
      if (code) {
        resp = await this.webApiSvr.leaveVisitor(code);
      } else if (inviteCode) {
        resp = await this.webApiSvr.leaveVisitor(null, inviteCode);
      } else if (credNum) {
        resp = await this.webApiSvr.leaveVisitor(null, null, "身份证", credNum);
      }

      if (!resp) {
        this.globalSvr.showAlert("提示", "访客签离失败,无响应!");
        return;
      }

      if (resp.code !== 200) {
        let msg: string;
        msg = `访客签离失败:[${this.webApiSvr.getErrorMsg(resp.code)}]!`;
        this.globalSvr.showAlert("提示", msg);
        return;
      }

      await this.globalSvr.showAlert("提示", `访客签离成功!`);
      this.navCtrl.pop();
    } catch (err) {
      let errMsg: string;

      console.error(err);

      if (err instanceof WebError && err.textStatus === "timeout") {
        errMsg = `网络请求超时!`;
      } else {
        errMsg = `提交登记信息时出现错误!`;
      }

      this.globalSvr.showAlert("提示", errMsg);
    }
  }

  private setHandler() {
    this.subEvent = this.nativeSvr
      .subscribe_Event()  // 调用事件接口
      .subscribe((event: AndroidEvent) => {
        if (!event) return;

        if (Date.now() - this.time < 1200) return;
        this.time = Date.now();

        switch (event.Code) {
          case EventCode.EVENT_SCAN_CODE:   // EventCode为2
            {
              let code: string = event.Param1.trim();

              if (this.globalSvr.offlineMode) {
                this.checkoutOffline(code);
              } else {
                let regexp: RegExp = new RegExp(/^\d{6}$/);  // 只能输入6位数字的正则表达式

                if (regexp.test(code) === false) {
                  this.checkoutOnline(code);
                } else {
                  this.checkoutOnline(null, code);
                }
              }
            }
            break;
        }
      });

    this.subIdcard = this.nativeSvr
      .subscribe_IdCard() //调用订阅二代证接口
      .subscribe((info: IdCardInfo) => {
        if (!info) return;
        if (Date.now() - this.time < 1200) return;
        this.time = Date.now();

        this.nativeSvr.beep();

        if (this.globalSvr.offlineMode) {
          this.checkoutOffline(null, info.IdNo);
        } else {
          this.checkoutOnline(null, null, info.IdNo);
        }
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
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
