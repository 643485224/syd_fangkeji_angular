import { Component, ApplicationRef, NgZone } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { DataAccessLayerProvider } from "../../providers/data-access-layer/data-access-layer";
import {
  PrintRequest,
  TaskResult,
  NativeApiProvider,
  TaskCode
} from "../../providers/native-api/native-api";
import { GlobalProvider } from "../../providers/global/global";
import { sleep } from "../../app/common";

@Component({
  selector: "page-setting10",
  templateUrl: "setting10.html"
})
export class Setting10Page {
  constructor(
    public appRef: ApplicationRef,
    public zone: NgZone,
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeApi: NativeApiProvider,
    public dal: DataAccessLayerProvider
  ) { }
  protected strText: string = "";
  protected dataUrl: string = "";
  private timer: number = null;

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

  protected async btnPrintTest0_onClick(event: any) {
    let promise: Promise<any>;

    try {
      promise = this.nativeApi.execTask(
        TaskCode.TASK_PRINT_TEST,
        0,
        null,
        null,
        3000
      );

      if (promise) {
        this.globalSvr.showLoading("执行打印任务中");
        await promise;
        this.globalSvr.hideLoading();
        this.globalSvr.showAlert("提示", "打印完毕!");
      }
    } catch (err) {
      console.error(err);
      this.globalSvr.hideLoading();
      this.globalSvr.showAlert("警告", "打印失败!");
    }
  }

  protected async btnPrintTest1_onClick(event: any) {
    let print: PrintRequest = new PrintRequest();
    let result: TaskResult;

    print.Title = "访客登记单";
    print.Name = "张三";
    print.Sex = "男";
    print.Folk = "汉";
    print.Interviewee = "李四";
    print.Reason = "浏览参观";
    print.Company = "深圳市XXXX公司"
    print.Code = "1234567890";
    print.RegCode = "123456";
    print.CardNum = "960537874";

    try {
      result = await this.nativeApi.printForm(print);

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

  protected async btnPrintTest2_onClick(event: any) {
    let promise: Promise<any>;

    try {
      promise = this.nativeApi.execTask(
        TaskCode.TASK_PRINT_TEST_MUL,
        0,
        null,
        null,
        3000
      );

      if (promise) {
        this.globalSvr.showLoading("执行打印任务中");
        await promise;
        this.globalSvr.hideLoading();
        this.globalSvr.showAlert("提示", "打印完毕!");
      }
    } catch (err) {
      console.error(err);
      this.globalSvr.hideLoading();
      this.globalSvr.showAlert("警告", "打印失败!");
    }
  }

  protected async btnPrintTest3_onClick(event: any) {
    let promise: Promise<any>;
    let print: PrintRequest = new PrintRequest();

    try {
      print.Name = "张三";
      print.Sex = "男";
      print.Folk = "汉";
      print.Interviewee = "李四";
      print.Code = "1234567890";
      print.CardNum = "960537874";

      promise = this.nativeApi.execTask(
        TaskCode.TASK_PRINT_TEST_FORM_MUL,
        0,
        JSON.stringify(print),
        null,
        3000
      );

      if (promise) {
        this.globalSvr.showLoading("执行打印任务中");
        await promise;
        this.globalSvr.hideLoading();
        this.globalSvr.showAlert("提示", "打印完毕!");
      }
    } catch (err) {
      console.error(err);
      this.globalSvr.hideLoading();
      this.globalSvr.showAlert("警告", "打印失败!");
    }
  }

  protected async btnPrintTest10_onClick(event: any) {
    let promise: Promise<any>;

    try {
      for (let i: number = 0; i < 10; i++) {
        promise = this.nativeApi.execTask(
          TaskCode.TASK_PRINT_TEST,
          0,
          null,
          null,
          3000
        );

        if (promise) {
          this.globalSvr.showLoading("执行打印任务中");
          await promise;
          this.globalSvr.hideLoading();
        }

        await sleep(300);
      }

      this.globalSvr.showAlert("提示", "打印完毕!");
    } catch (err) {
      console.error(err);
      this.globalSvr.hideLoading();
      this.globalSvr.showAlert("警告", "打印失败!");
    }
  }

  protected async btnPrintTest11_onClick(event: any) {
    let print: PrintRequest = new PrintRequest();
    let result: TaskResult;

    for (let i: number = 0; i < 10; i++) {
      print.Title = "访客登记单";
      print.Name = "张三";
      print.Sex = "男";
      print.Folk = "汉";
      print.Interviewee = "李四";
      print.Reason = "浏览参观";
      print.Company = "深圳市XXXX公司"
      print.Code = "1234567890";
      print.RegCode = "123456";
      print.CardNum = "960537874";

      try {
        result = await this.nativeApi.printForm(print);

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

      await sleep(3000);
    }

    this.globalSvr.showAlert("提示", "全部打印完毕!");
  }

  protected async btnPrintTest12_onClick(event: any) {
    let promise: Promise<any>;

    try {
      for (let i: number = 0; i < 10; i++) {
        promise = this.nativeApi.execTask(
          TaskCode.TASK_PRINT_TEST_MUL,
          0,
          null,
          null,
          3000
        );

        if (promise) {
          this.globalSvr.showLoading("执行打印任务中");
          await promise;
          this.globalSvr.hideLoading();
        }

        await sleep(300);
      }

      this.globalSvr.showAlert("提示", "打印完毕!");
    } catch (err) {
      console.error(err);
      this.globalSvr.hideLoading();
      this.globalSvr.showAlert("警告", "打印失败!");
    }
  }

  protected async btnPrintTest13_onClick(event: any) {
    let promise: Promise<any>;
    let print: PrintRequest = new PrintRequest();

    try {
      for (let i: number = 0; i < 10; i++) {
        print.Name = "张三";
        print.Sex = "男";
        print.Folk = "汉";
        print.Interviewee = "李四";
        print.Code = "1234567890";
        print.CardNum = "960537874";

        promise = this.nativeApi.execTask(
          TaskCode.TASK_PRINT_TEST_FORM_MUL,
          0,
          JSON.stringify(print),
          null,
          3000
        );

        if (promise) {
          this.globalSvr.showLoading("执行打印任务中");
          await promise;
          this.globalSvr.hideLoading();
        }

        await sleep(300);
      }

      this.globalSvr.showAlert("提示", "打印完毕!");
    } catch (err) {
      console.error(err);
      this.globalSvr.hideLoading();
      this.globalSvr.showAlert("警告", "打印失败!");
    }
  }

  protected async btnTaskTest_onClick(event: any) {
    let promise: Promise<any>;

    try {
      promise = this.nativeApi.execTask(
        TaskCode.TASK_TEST,
        0,
        null,
        null,
        3000
      );

      if (promise) {
        this.globalSvr.showLoading("执行回调任务中");
        await promise;
        this.globalSvr.hideLoading();
        this.globalSvr.showAlert("提示", "执行回调完毕!");
      }
    } catch (err) {
      console.error(err);
      this.globalSvr.hideLoading();
      this.globalSvr.showAlert("警告", "执行回调失败!");
    }
  }

  protected btnTestUi_onClick(event: any) {
    this.globalSvr.showAlert("测试", "错误提示!");
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
