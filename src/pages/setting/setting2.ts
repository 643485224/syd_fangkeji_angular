import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { NativeApiProvider } from "../../providers/native-api/native-api";
import { GlobalProvider } from '../../providers/global/global';

const PAGE_TIMEOUT: number = 60000;

@Component({
  selector: "page-setting2",
  templateUrl: "setting2.html"
})
export class Setting2Page {
  protected clr1: string = "primary";
  protected clr2: string = "dark";
  protected clr3: string = "dark";
  protected curPwd: string = "";
  protected pwd1: string = "";
  protected pwd2: string = "";
  protected focused: number = 1;
  private timer: number = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeSvr: NativeApiProvider
  ) { }

  ionViewDidLoad() {
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

  protected onTextClick(id: number) {
    switch (id) {
      case 1:
        this.clr1 = "primary";
        this.clr2 = "dark";
        this.clr3 = "dark";
        break;
      case 2:
        this.clr1 = "dark";
        this.clr2 = "primary";
        this.clr3 = "dark";
        break;
      case 3:
        this.clr1 = "dark";
        this.clr2 = "dark";
        this.clr3 = "primary";
        break;
    }

    this.focused = id;
  }

  protected onNumDown(char: string) {
    switch (this.focused) {
      case 1:
        if (this.curPwd.length < 8) this.curPwd += char;
        break;
      case 2:
        if (this.pwd1.length < 8) this.pwd1 += char;
        break;
      case 3:
        if (this.pwd2.length < 8) this.pwd2 += char;
        break;
    }
  }

  protected onBackspace() {
    switch (this.focused) {
      case 1:
        if (this.curPwd.length)
          this.curPwd = this.curPwd.substring(0, this.curPwd.length - 1);
        break;
      case 2:
        if (this.pwd1.length)
          this.pwd1 = this.pwd1.substring(0, this.pwd1.length - 1);
        break;
      case 3:
        if (this.pwd2.length)
          this.pwd2 = this.pwd2.substring(0, this.pwd2.length - 1);
        break;
    }
  }

  protected onClean() {
    switch (this.focused) {
      case 1:
        this.curPwd = "";
        break;
      case 2:
        this.pwd1 = "";
        break;
      case 3:
        this.pwd2 = "";
        break;
    }
  }

  protected onSave(event: any) {
    let hash: string;

    if (window.$native) {
      hash = window.$native.sha256b64(this.curPwd);
    } else {
      hash = this.curPwd;
    }

    if (hash !== this.globalSvr.adminPwd) {
      this.globalSvr.showAlert("警告", "当前密码不正确!");
      return;
    }

    if (!this.pwd1) {
      this.globalSvr.showAlert("警告", "新密码不能为空!");
      return;
    }

    if (this.pwd1 !== this.pwd2) {
      this.globalSvr.showAlert("警告", "两次输入的密码不一致!");
      return;
    }

    if (window.$native) {
      hash = window.$native.sha256b64(this.pwd1);
    } else {
      hash = this.pwd1;
    }

    this.globalSvr.adminPwd = hash;
    this.nativeSvr.setConfig("passwd", this.globalSvr.adminPwd);
    this.navCtrl.pop();
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
