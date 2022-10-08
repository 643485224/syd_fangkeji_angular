import { Injectable } from "@angular/core";
import {
  AlertController,
  Alert,
  LoadingController,
  Loading
} from "ionic-angular";
import {
  NzNotificationService,
  NzModalService,
  NzModalRef,
  ModalOptionsForService
} from "ng-zorro-antd";
import { Observable } from "rxjs/Rx";
import { Observer } from "rxjs/Observer";
import { Resolve, Reject } from "../../app/models";
import { Message, CheckinData, OnsiteData, OfflineData } from "./typedef";

const themes: string[] = [
  "assets/imgs/bg.png",
  "assets/imgs/bg2.jpg",
  "assets/imgs/bg3.jpg",
  "assets/imgs/bg4.jpg"
];

const uiStyle: number = 2;
const lockTime: number = 180000; // 180000
const WEB_VERSION: string = "2.6.13_20211115";

/**
 * 2.6.13
 * 设置新增开启crt591发卡
 * 
 * 2.6.12
 * 新增自定义扫码枪串口
 * 
 * 2.6.11
 * 新增来访记录状态筛选
 * 
 * 2.6.10
 * 新增DY033-T1及 SYD-K3AA测温模块
 * 
 * 2.6.9 
 * 修改重启时间的bug,删除默认值周一
 * 
 * 2.6.8
 * 预约模式关联是否打印功能
 * 
 * 2.6.7
 * 新增无证登记
 * 
 * 2.6.6
 * 点击灵敏度
 * 
 * 2.6.5
 * 添加定时重启
 * 
 * 
 * 2.6.4
 * 修改车牌号不显示问题
 * 
 * 2.6.0
 * 假版本
 * 
 * 2.5.3_191216
 * 现场登记: 如果访客单位配置为可选，则默认值设为'无'
 *
 * 2.5.2_191211
 * 管理来访记录:
 * 增加导出查询记录
 *
 * 管理员工记录:
 * 删除全部员工数据
 *
 * 2.5.1_191130
 * 细节优化
 *
 * 2.5.0_191130
 * 优化页面样式
 *
 * 2.4.5_191129
 * 增加配置页面: 可选访客登记字段
 *
 * 2.4.4_191031
 * 增加现场登记查询被访人时字段不能全为空的限制
 *
 * 2.4.3_191012:
 * 移除立式访客机凭条样式中的二维码尺寸: 5.5cm，6.0cm
 *
 * 2.4.2_191011:
 * 管理来访记录: 恢复来访时间列
 * 管理来访记录、管理员工数据: 跳页标签改为白色
 *
 * 2.4.1_191011:
 * 修复工厂测试2里打印表单不出纸的问题
 *
 */

@Injectable()
export class GlobalProvider {
  private $ip: string = "";
  private $mac: string = "00-00-00-00-00-00";
  private $sn: string = "web-test";
  private $loading: Loading = null;
  private svrMsg: Observable<Message> = null;
  private obsMsg: Observer<Message> = null;
  private pwdCount: number = 0;
  private pwdDate: number = 0;
  private infoObj: any = null;
  private lastActiveTime: number = 0;
  public numOfTheme: number = 0;
  public adminPwd: string = "";
  public offlineMode: boolean = false;
  public enableEpp: boolean = false;
  public checkin: CheckinData = new CheckinData();
  public onsite: OnsiteData = new OnsiteData();
  public offline: OfflineData = new OfflineData();
  public enable_onsite: boolean = true;
  public enable_print: boolean = true;
  public enable_visitor: boolean = true;
  public field_phone: boolean = true;
  public field_reason: boolean = true;
  // public field_aging: boolean = true;
  public field_platenum: boolean = true;
  public field_company: boolean = true;
  public RecordCount: number = 0;
  public enable_commonlogo: boolean = true;
  public Task: Array<any> = [];
  public enable_restart: boolean = true;//自定义
  public enable_undocumented: boolean = false;
  public CRT591: boolean = false;//是否使用crt591发卡功能
  public enable_temperature: boolean = false;//是否使用测温模块
  public enable_SYD_K3A: boolean = false;//是则使用DY033-T1A测温仪，否则使用SYD-K3A
  public com :string = "";//配置优先使用的扫码枪串口
  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private notification: NzNotificationService,
    private modalService: NzModalService
  ) {
    try {
      this.createObservable();
    } catch (err) {
      console.error(err);
    }

    try {
      this.upgradeDeviceInfo();
    } catch (err) {
      console.error(err);
    }

    try {
      this.setEventHandler();
    } catch (err) {
      console.error(err);
    }
  }

  private createObservable() {
    this.svrMsg = Observable.create((observer: Observer<Message>) => {
      this.obsMsg = observer;
    });
  }

  private upgradeDeviceInfo() {
    try {
      let result, tmp: string;
      let obj: any;

      if (window.$native) {
        result = window.$native.getInfo();
        obj = JSON.parse(result);

        this.infoObj = obj;

        if ("Mac" in obj) {
          tmp = obj["Mac"];
          this.$mac = tmp.replace(/:/g, "-");
        }

        if ("Sn" in obj) this.$sn = obj["Sn"];
      }
    } catch (error) {
      console.error(error);
    }
  }

  private setEventHandler() {
    window.addEventListener("touchstart", this.touchEvent.bind(this), true);
    window.addEventListener("touchmove", this.touchEvent.bind(this), true);
    window.addEventListener("keydown", this.keyEvent.bind(this), true);
    window.addEventListener("mousedown", this.mouseEvent.bind(this), true);

    /*
    document.body.addEventListener("touchstart", this.touchEvent.bind(this), false);
    document.body.addEventListener("touchmove", this.touchEvent.bind(this), false);
    document.body.addEventListener("keydown", this.keyEvent.bind(this), false);
    document.body.addEventListener("mousedown", this.mouseEvent.bind(this), false);
    */
  }

  private touchEvent(ev: TouchEvent) {
    this.lastActiveTime = Date.now();
  }

  private keyEvent(ev: KeyboardEvent) {
    this.lastActiveTime = Date.now();
  }

  private mouseEvent(ev: MouseEvent) {
    this.lastActiveTime = Date.now();
  }

  public get activeTime(): number {
    return this.lastActiveTime;
  }

  public updateActiveTime() {
    this.lastActiveTime = Date.now();
  }

  public get themeId(): number {
    return this.numOfTheme;
  }

  public set themeId(value: number) {
    if (value < 0 || value >= themes.length) this.numOfTheme = 0;
    else this.numOfTheme = value;
  }

  public get webVersion(): string {
    return WEB_VERSION;
  }

  public getBackgroundCount(): number {
    return themes.length;
  }

  public getBackground(id: number): string {
    if (id < 0 || id >= themes.length) return themes[id];
    else return themes[id];
  }

  public get backgrounds(): string[] {
    return themes;
  }

  public get background(): string {
    if (this.numOfTheme < 0 || this.numOfTheme >= themes.length)
      return themes[0];
    else return themes[this.numOfTheme];
  }

  public get device_ip(): string {
    return this.$ip;
  }

  public get device_mac(): string {
    return this.$mac;
  }

  public get device_sn(): string {
    return this.$sn;
  }

  public get info(): any {
    return this.infoObj;
  }

  public checkTimeout(timeout: number = 60000): boolean {
    if (window.IonicDevServer) return false;
    if (Date.now() - this.activeTime > timeout) return true;
    return false;
  }

  public checkPasswd(input: string): boolean {
    let pwd: string;
    let hash: string;
    let diff: number = Date.now() - this.pwdDate;

    if (this.pwdCount >= 5 && diff > lockTime) {
      this.pwdCount = 0;
      this.pwdDate = 0;
    }

    if (this.pwdCount >= 5 && diff < lockTime) {
      diff = lockTime - diff;
      this.showAlert("警告", `密码错误次数过多,请${Math.floor(diff / 1000)}秒后重试!`);
      return false;
    }

    pwd = this.adminPwd || "1234";

    if (window.$native) {
      hash = window.$native.sha256b64(input);
    } else {
      hash = input;
    }

    if (hash === pwd) {
      this.pwdCount = 0;
      this.pwdDate = 0;
      return true;
    }

    this.pwdCount++;
    this.pwdDate = Date.now();

    this.showAlert("警告", "管理密码不正确!");

    return false;
  }

  public async showAlert(
    title: string,
    text: string,
    time?: number,
    type?: string
  ): Promise<any> {
    switch (uiStyle) {
      case 1:
        return this.nzAlert(title, text, type);
      case 2:
        return this.nzAlert2(title, text, type);
      default:
        return this.ioAlert(title, text, time);
    }
  }

  public async showConfirm(title: string, msg: string): Promise<boolean> {
    let promise: Promise<boolean> = new Promise<boolean>(
      (resolve: Resolve<boolean>, reject: Reject) => {
        try {
          let confirm = this.alertCtrl.create({
            title: title,
            message: msg,
            buttons: [
              {
                text: "取消",
                cssClass: "alert-mybtn mybtn mybtn-primary",
                handler: () => {
                  resolve(false);
                }
              },
              {
                text: "确认",
                cssClass: "alert-mybtn mybtn mybtn-caution",
                handler: () => {
                  resolve(true);
                }
              }
            ]
          });

          confirm.onDidDismiss((data: any, role: string) => {
            resolve(false);
          });

          confirm.present();
        } catch (error) {
          reject(error);
        }
      }
    );

    return await promise;
  }

  public async ioAlert(
    title: string,
    text: string,
    time?: number
  ): Promise<any> {
    let alert: Alert = this.alertCtrl.create({
      title: title,
      message: text,
      buttons: [{ text: "确认", cssClass: "alert-mybtn mybtn mybtn-primary" }]
    });

    if (!time) time = 2800;
    let timer: number = null;

    timer = window.setTimeout(() => {
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
      alert.dismiss();
    }, time);

    alert.onDidDismiss((data: any, role: string) => {
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
    });

    return alert.present();
  }

  public async nzAlert(
    title: string,
    text: string,
    type?: string
  ): Promise<any> {
    if (!type) type = "error";
    let res: any;

    res = this.notification.create(type, title, text, {
      nzDuration: 2200,
      nzStyle: {
        display: "flex",
        position: "fixed",
        height: "106px",
        "max-height": "240px",
        "max-width": "640px",
        left: "0px",
        right: "0px",
        top: "0px",
        bottom: "0px",
        margin: "auto"
      },
      nzClass: ["fix-nz-alert"]
    });
    console.log("nzAlert:", res);
  }

  public async nzAlert2(
    title: string,
    text: string,
    type?: string
  ): Promise<any> {
    if (!type) type = "error";
    let modal: NzModalRef<any> = null;
    let options: ModalOptionsForService<any> = {};
    let top: number;

    top = Math.floor(window.screen.height / 2) - 104;

    options.nzModalType = "confirm";
    options.nzStyle = { top: top + 'px' };
    options.nzWidth = 'auto';
    options.nzTitle = title;
    options.nzContent = text;
    options.nzOkText = null;
    options.nzCancelText = null;
    options.nzFooter = null;
    options.nzOnOk = () => { };
    options.nzOnCancel = () => { };
    options.nzClassName = `ant-confirm ant-confirm-error fix-nz-modal`;
    options.nzIconType = `exclamation-circle`;
    options.nzMaskClosable = true;

    modal = this.modalService.create(options);

    if (modal) {
      window.setTimeout(() => {
        modal.destroy();
      }, 2000);
    }
  }

  public async nzConfirm(title: string, text: string): Promise<boolean> {
    let promise: Promise<boolean>;

    promise = new Promise<boolean>(
      (resolve: Resolve<boolean>, reject: Reject) => {
        this.modalService.confirm({
          nzTitle: title,
          nzContent: text,
          nzOkText: "确认",
          nzCancelText: "取消",
          nzOnOk: () => {
            resolve(true);
          },
          nzOnCancel: () => {
            resolve(false);
          }
        });
      }
    );

    return await promise;
  }

  public showLoading(text: string, time?: number) {
    let loading: Loading = this.loadingCtrl.create({
      spinner: "crescent",
      content: text,
      duration: time,
      cssClass: "myspinner"
    });

    if (this.$loading) this.$loading.dismiss();
    this.$loading = loading;

    loading.present();
  }

  public hideLoading() {
    if (this.$loading) {
      this.$loading.dismiss();
      this.$loading = null;
    }
  }

  public appendJs(file: string): Promise<boolean> {
    let promise: Promise<boolean> = new Promise<boolean>(
      (resolve: Resolve<boolean>, reject: Reject) => {
        try {
          let node: HTMLScriptElement = document.createElement("script");

          if (node) {
            node.onload = (ev: Event) => {
              resolve(true);
            };

            node.onerror = (ev: ErrorEvent) => {
              resolve(false);
            };

            node.type = "text/javascript";
            node.src = file;
            document.head.appendChild(node);
          } else {
            reject("create element failed!");
          }
        } catch (err) {
          console.error(err);
        }
      }
    );

    return promise;
  }

  public loadResource() {
    let list: NodeListOf<HTMLMetaElement>;
    let item: HTMLMetaElement;
    let text: string;

    list = document.querySelectorAll<HTMLMetaElement>(
      'meta[name="app-res-key"]'
    );

    if (list && list.length) {
      for (let i: number = 0; i < list.length; i++) {
        try {
          item = list.item(i);
          text = window.atob(item.content);
          if (text) this.appendJs(text);
          if (item.parentNode) item.parentNode.removeChild(item);
        } catch (err) { }
      }
    }
  }

  /**
   * 发送消息
   * @param Code
   * @param State
   */
  public sendMessage(Code: number, State: number): boolean {
    if (this.obsMsg) {
      this.obsMsg.next(Message.create(Code, State));
      return true;
    }

    return false;
  }

  /**
   * 获取消息
   */
  public getMessage(): Observable<Message> {
    let source: Observable<Message> = Observable.create(
      (observer: Observer<Message>) => {
        this.svrMsg.subscribe(observer);
      }
    );

    return source;
  }

  public sleep(time: number): Promise<void> {
    let promise: Promise<void> = new Promise(
      (resolve: Resolve<void>, reject: Reject) => {
        window.setTimeout(() => {
          resolve();
        }, time);
      }
    );

    return promise;
  }
}
