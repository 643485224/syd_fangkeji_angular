import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { EntryOnlinePage } from "../entry-online/entry-online";
import { EntryOfflinePage } from "../entry-offline/entry-offline";
import { WelcomePage } from "../welcome/welcome";
import { NativeApiProvider } from "../../providers/native-api/native-api";
import { GlobalProvider } from "../../providers/global/global";
import { Subscription } from "../../../node_modules/rxjs";
import { WebapiProvider } from "../../providers/webapi/webapi";
import { DataAccessLayerProvider } from "../../providers/data-access-layer/data-access-layer";
import { Resolve, Reject } from "../../app/models";
import { getBool } from "../../app/common";
import { Message } from "../../providers/global/typedef";
import { QueryFailedError } from "typeorm";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  public currPage: any = WelcomePage;
  private subMsg: Subscription;

  constructor(
    public navCtrl: NavController,
    public globalSvr: GlobalProvider,
    public nativeApi: NativeApiProvider,
    public webApiSvr: WebapiProvider,
    public dalSvr: DataAccessLayerProvider
  ) {

  }

  ionViewDidLoad() {
    let val: string;

    this.initDatabase();

    this.globalSvr.showLoading("加载配置中");

    this.handleMessage();

    val = this.nativeApi.getConfig("init");

    // 进行过初始化设置, 进入入口
    if (val === "1" || val === null) {
      this.initProc();
    }

    window.setTimeout(() => {
      this.globalSvr.hideLoading();
    }, 100);
  }

  private async initDatabase() {
    try {
      await this.dalSvr.init();
    } catch (err) {
      console.error(err);

      if ('message' in err && err.message === "sqlite3_prepare_v2 failure: database disk image is malformed") {
        this.globalSvr.showAlert("错误", "系统检测到数据库文件受损, 请联系管理人员进行修复, 否则脱机模式将不能工作!");
      } else {
        this.globalSvr.showAlert("错误", `连接数据库异常: ${err}!`);
      }
    }
  }

  private initProc() {
    this.loadConfig();

    // 判断离线模式
    if (this.globalSvr.offlineMode) {
      this.currPage = EntryOfflinePage;
    } else {
      this.currPage = EntryOnlinePage;

      window.setTimeout(async () => {
        let promise: Promise<boolean>;

        promise = this.webApiSvr.connectServer(this.globalSvr.device_mac);

        if (false === (await promise)) {
          console.log("登录失败, 开始自动重连 ...");
          this.webApiSvr.tryReconnect();
        }
      }, 2);
    }
  }

  private loadConfig() {
    try {
      
      let val: string;
      val = this.nativeApi.getConfig("CRT591");
      this.globalSvr.CRT591 = getBool(val);

      val = this.nativeApi.getConfig("SYD-K3A");
      this.globalSvr.enable_SYD_K3A = getBool(val);
      
      val = this.nativeApi.getConfig("offline");
      this.globalSvr.offlineMode = getBool(val);

      val = this.nativeApi.getConfig("ip");
      if (val) this.webApiSvr.host = val;

      val = this.nativeApi.getConfig("port");
      if (val) this.webApiSvr.port = Number(val);

      val = this.nativeApi.getConfig("regcode");
      if (val) this.webApiSvr.regcode = val;

      val = this.nativeApi.getConfig("enckey");
      if (val) this.webApiSvr.encKey = val;

      val = this.nativeApi.getConfig("passwd");
      if (val && val.length !== 44 && window.$native) {
        val = window.$native.sha256b64(val);
        this.nativeApi.setConfig("passwd", val);
      }
      this.globalSvr.adminPwd = val;

      val = this.nativeApi.getConfig("theme");
      this.globalSvr.themeId = Number(val);

      val = this.nativeApi.getConfig("RecordCount");
      this.globalSvr.RecordCount = Number(val);

      val = this.nativeApi.getConfig("enable_epp");
      this.globalSvr.enableEpp = getBool(val);

      val = this.nativeApi.getConfig("enable_onsite");
      if (!val && window.$native) {
        val = String(true);
        this.nativeApi.setConfig("enable_onsite", val);
      }
      this.globalSvr.enable_onsite = getBool(val);

      val = this.nativeApi.getConfig("enable_print");
      if (!val && window.$native) {
        val = String(true);
        this.nativeApi.setConfig("enable_print", val);
      }
      this.globalSvr.enable_print = getBool(val);

      val = this.nativeApi.getConfig("Task");
      if (!val && window.$native) {
        let newVal: Array<any> = [
          { "id": 2, "endTime": "02:00:00", "week": "周二" },
          { "id": 6, "endTime": "02:00:00", "week": "周六" }
        ]
        val = JSON.stringify(newVal)
        this.nativeApi.setConfig("Task", val);
      }

      val = this.nativeApi.getConfig("enable_restart");
      if (!val && window.$native) {
        val = String(true);
        this.nativeApi.setConfig("enable_restart", val);
      }
      this.globalSvr.enable_restart = getBool(val);

      val = this.nativeApi.getConfig("enable_undocumented");
      if (!val && window.$native) {
        val = String(false);
        this.nativeApi.setConfig("enable_undocumented", val);
      }
      this.globalSvr.enable_undocumented = getBool(val);

      val = this.nativeApi.getConfig("enable_temperature");
      if (!val && window.$native) {
        val = String(false);
        this.nativeApi.setConfig("enable_temperature", val);
      }
      this.globalSvr.enable_temperature = getBool(val);

      val = this.nativeApi.getConfig("enable_visitor");
      if (!val && window.$native) {
        val = String(true);
        this.nativeApi.setConfig("enable_visitor", val);
      }
      this.globalSvr.enable_visitor = getBool(val);

      val = this.nativeApi.getConfig("field_phone");
      if (!val && window.$native) {
        val = String(true);
        this.nativeApi.setConfig("field_phone", val);
      }
      this.globalSvr.field_phone = getBool(val);

      val = this.nativeApi.getConfig("field_reason");
      if (!val && window.$native) {
        val = String(true);
        this.nativeApi.setConfig("field_reason", val);
      }
      this.globalSvr.field_reason = getBool(val);

      val = this.nativeApi.getConfig("field_platenum");
      if (!val && window.$native) {
        val = String(true);
        this.nativeApi.setConfig("field_platenum", val);
      }
      this.globalSvr.field_platenum = getBool(val);

      val = this.nativeApi.getConfig("field_company");
      if (!val && window.$native) {
        val = String(true);
        this.nativeApi.setConfig("field_company", val);
      }
      this.globalSvr.field_company = getBool(val);

      val = this.nativeApi.getConfig("enable_commonlogo");
      if (!val && window.$native) {
        val = String(true);
        this.nativeApi.setConfig("enable_commonlogo", val);
      }
      this.globalSvr.enable_commonlogo = getBool(val);
    } catch (err) {
      console.error("error in loadConfig:", err);
    }
  }

  private handleMessage() {
    this.subMsg = this.globalSvr.getMessage().subscribe((msg: Message) => {
      switch (msg.Code) {
        case 1:
          this.initProc();
          break;
      }
    });
  }
}
