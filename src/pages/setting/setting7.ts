import { Component, ApplicationRef, NgZone, ViewChild } from "@angular/core";
import { NavController, NavParams, Select } from "ionic-angular";
import { DataAccessLayerProvider } from "../../providers/data-access-layer/data-access-layer";
import { TTest } from "../../entities/ttest";
import { Subscription } from "rxjs";
import {
  AndroidEvent,
  EventCode,
  ReadPpResult,
  IdCardInfo,
  TaskResult,
  OcrPpInfo,
  ReadPpRequest,
  TaskCode,
  NativeApiProvider,
  InvsCardResponse
} from "../../providers/native-api/native-api";
import { GlobalProvider } from "../../providers/global/global";
import { InfoData, Resolve, Reject } from '../../app/models';
import { sleep } from "../../app/common";
import { TRecord } from '../../entities/trecord';
import { WebapiProvider, VisitorInfo, JsonResponse } from '../../providers/webapi/webapi';
import { TStaff } from '../../entities/tstaff';
import { DeleteResult } from "typeorm";

class Stats {
  min: number = null;
  max: number = null;
  avg: number = null;
}

@Component({
  selector: "page-setting7",
  templateUrl: "setting7.html"
})
export class Setting7Page {
  constructor(
    public appRef: ApplicationRef,
    public zone: NgZone,
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeApi: NativeApiProvider,
    public webApiSvr: WebapiProvider,
    public dal: DataAccessLayerProvider
  ) { }

  protected stateDb: boolean = false;
  protected stateOcr: boolean = false;
  protected req: ReadPpRequest = new ReadPpRequest();
  protected subBarcode: Subscription = null;
  protected strText: string = "";
  protected dataUrl: string = "";
  private subIdcard: Subscription = null;
  private timer: number = null;

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
    this.setHandler();
  }

  ionViewDidLeave() {
    this.cleanTimer();
    this.cleanHandler();
  }

  protected onConsoleClick() {
    if (window.$console) {
      window.$console.show();
    }
  }

  private setHandler() {
    this.subIdcard = this.nativeApi
      .subscribe_IdCard()
      .subscribe((data: IdCardInfo) => {
        if (data == null) return;

        this.dataUrl = "data:image/jpeg;base64," + data.Head;
        delete data.Head;
        this.strText = JSON.stringify(data);
      });

    this.subBarcode = this.nativeApi
      .subscribe_Event()
      .subscribe((value: AndroidEvent) => {
        switch (value.Code) {
          case EventCode.EVENT_SCAN_CODE:
            this.strText = `??????/?????????:\r\n[${value.Param1}]`;
            break;
        }
      });
  }

  private cleanHandler() {
    if (this.subIdcard) {
      this.subIdcard.unsubscribe();
      this.subIdcard = null;
    }

    if (this.subBarcode) {
      this.subBarcode.unsubscribe();
      this.subBarcode = null;
    }
  }

  private statsTime(times: number[]): Stats {
    let result: Stats = new Stats();

    result.avg = 0;

    times.forEach((time: number) => {
      if (result.min === null || time < result.min) {
        result.min = time;
      }

      if (result.max === null || time > result.max) {
        result.max = time;
      }

      result.avg += time;
    });

    result.avg = result.avg / times.length;

    return result;
  }

  protected async btnExcelTest_onClick(event: any) {
    let promise: Promise<any>;

    this.strText = "";
    this.dataUrl = "";

    try {
      promise = this.nativeApi.execTask(
        TaskCode.TASK_TEST_EXCEL,
        0,
        null,
        null,
        3000
      );

      await promise;
    } catch (err) {
      console.error(err);
    }
  }

  protected btnDbInsTest_onClick(event: any) {
    let times: number[] = new Array<number>();

    this.strText = "";
    this.dataUrl = "";
    this.stateDb = true;

    window.setTimeout(async () => {
      this.appRef.tick();

      try {
        let max: number = 200;
        let stats: Stats;
        let time: number;

        for (let i: number = 1; i <= max; i++) {
          this.zone.run(() => {
            this.strText = `???????????????[${i}/${max}]?????????.`;
          }, this);

          this.appRef.tick();

          let test: TTest = new TTest();
          test.text = `????????????:${i}`;
          test.Date = new Date();

          time = Date.now();
          await this.dal.save(TTest, test);
          time = Date.now() - time;

          times.push(time);
        }

        stats = this.statsTime(times);

        this.strText = `??????????????????: {????????????: ${stats.min} ????????????: ${stats.max
          } ????????????: ${stats.avg}}`;
      } catch (err) {
        console.error(err);
      } finally {
        this.stateDb = false;
      }
    }, 0);
  }

  protected btnDbQuyTest_onClick(event: any) {
    let times: number[] = new Array<number>();

    this.strText = "";
    this.dataUrl = "";
    this.stateDb = true;

    window.setTimeout(async () => {
      let time: number;

      this.appRef.tick();

      try {
        let max: number = 100;
        let stats: Stats;

        for (let i: number = 1; i <= max; i++) {
          this.strText = `?????????[${i}/${max}]?????????.`;
          this.appRef.tick();

          time = Date.now();
          await this.dal.queryPaged(TTest, 0, 100, { id: 10 });
          time = Date.now() - time;

          times.push(time);
        }

        stats = this.statsTime(times);

        this.strText = `??????????????????: {????????????: ${stats.min} ????????????: ${stats.max
          } ????????????: ${stats.avg}}`;
      } catch (err) {
        console.error(err);
      } finally {
        this.stateDb = false;
      }
    }, 0);
  }

  protected btnDbQuyAllTest_onClick(event: any) {
    let times: number[] = new Array<number>();

    this.strText = "";
    this.dataUrl = "";
    this.stateDb = true;

    window.setTimeout(async () => {
      let time: number;
      this.appRef.tick();

      try {
        let max: number = 100;
        let stats: Stats;
        let result: any;

        for (let i: number = 1; i <= max; i++) {
          this.strText = `?????????[${i}/${max}]?????????.`;
          this.appRef.tick();

          time = Date.now();
          result = await this.dal.queryPaged(TTest, 0, 1000);
          time = Date.now() - time;

          console.log("QuyAll:", result);

          times.push(time);
        }

        stats = this.statsTime(times);

        this.strText = `????????????????????????: {????????????: ${stats.min} ????????????: ${stats.max
          } ????????????: ${stats.avg}}`;
      } catch (err) {
        console.error(err);
      } finally {
        this.stateDb = false;
      }
    }, 0);
  }

  protected btnDbDelTest_onClick(event: any) {
    let times: number[] = new Array<number>();

    this.strText = "";
    this.dataUrl = "";
    this.stateDb = true;

    window.setTimeout(async () => {
      let time: number;

      this.appRef.tick();

      try {
        let max: number = 100;
        let stats: Stats;

        for (let i: number = 1; i <= max; i++) {
          this.strText = `?????????[${i}/${max}]?????????.`;
          this.appRef.tick();

          time = Date.now();
          await this.dal.deleteAll(TTest, 'id');
          time = Date.now() - time;

          times.push(time);
        }

        stats = this.statsTime(times);

        this.strText = `??????????????????: {????????????: ${stats.min} ????????????: ${stats.max
          } ????????????: ${stats.avg}}`;
      } catch (err) {
        console.error(err);
      } finally {
        this.stateDb = false;
      }
    }, 0);
  }

  protected btnDbInsRecord_onClick(event: any) {
    let times: number[] = new Array<number>();

    this.strText = "";
    this.dataUrl = "";
    this.stateDb = true;

    window.setTimeout(async () => {
      this.appRef.tick();

      try {
        let max: number = 500;
        let stats: Stats;
        let time: number;
        let count: number;

        for (let i: number = 1; i <= max; i++) {
          this.zone.run(() => {
            this.strText = `???????????????[${i}/${max}]?????????.`;
          }, this);

          this.appRef.tick();

          let record: TRecord = new TRecord();

          record.type = -1;
          record.state = 1;
          record.v_name = "??????????????????";
          record.v_company = "????????????";
          record.v_department = "????????????";
          record.v_sex = 1;
          record.v_mobile = "17665320000";
          record.s_name = "??????????????????";
          record.s_jobNum = "0000";
          record.s_mobile = "13179810000";

          record.barcode = Math.random().toString().split('.')[1].substr(0, 10);
          record.reason = "????????????";
          record.visitTime = Date.now();

          time = Date.now();
          await this.dal.save(TRecord, record);
          time = Date.now() - time;

          times.push(time);
        }

        stats = this.statsTime(times);
        count = await this.dal.count(TRecord);

        this.strText = `????????????????????????: {????????????: ${max} ???????????????: ${count} ????????????: ${stats.min} ????????????: ${stats.max
          } ????????????: ${stats.avg}}`;
      } catch (err) {
        this.strText = `?????????????????????!`;
        console.error(err);
      } finally {
        this.stateDb = false;
      }
    }, 0);
  }

  protected btnDbCheckout_onClick(event: any) {
    let records: TRecord[];
    let promises: Promise<void>[] = new Array<Promise<void>>();

    this.strText = "";
    this.dataUrl = "";
    this.stateDb = true;

    window.setTimeout(async () => {
      this.appRef.tick();

      try {
        let res: any;
        let time: number;
        let times: number[] = new Array<number>();
        let count: number;

        res = await this.dal.query(TRecord, { type: -1, state: 1 });

        if (typeof res === 'number') {
          this.strText = `??????????????????: ${res}.`;
          return;
        }

        records = res as TRecord[];

        if (!records) {
          this.strText = `???????????????????????????????????????`;
          return;
        }

        count = records.length;

        records.forEach((value: TRecord) => {
          value.state = 2;

          let promise: Promise<any>;

          promise = new Promise<any>(async (resolve: Resolve<any>, reject: Reject) => {
            try {
              time = Date.now();
              await this.dal.save(TRecord, value);
              time = Date.now() - time;
              times.push(time);
            } catch (err) {
              console.error(err);
            }

            resolve();
          });

          promises.push(promise);
        });

        this.strText = `???????????????, ?????????...`;
        await Promise.all(promises);
        this.strText = `??????????????????: {???????????????: ${count} ?????????: ${time}}`;
      } catch (err) {
        this.strText = "???????????????????????????!";
        console.error(err);
      } finally {
        this.stateDb = false;
      }
    }, 0);
  }

  protected btnDbInsOnlineRecord_onClick(event: any) {
    let times: number[] = new Array<number>();

    this.strText = "";
    this.dataUrl = "";
    this.stateDb = true;

    if (this.webApiSvr.state !== 1) {
      this.strText = `???????????????, ??????????????????!`;
      return;
    }

    window.setTimeout(async () => {
      this.appRef.tick();

      try {
        let max: number = 200;
        let stats: Stats;
        let time: number;
        let info: VisitorInfo;
        let resp: JsonResponse;
        let success: number = 0;
        let failed: number = 0;

        for (let i: number = 1; i <= max; i++) {
          this.zone.run(() => {
            this.strText = `???????????????[${i}/${max}]?????????.`;
          }, this);

          this.appRef.tick();

          info = new VisitorInfo();
          info.v_name = "??????????????????";
          info.v_sex = 1;
          info.v_certificateType = "?????????";
          info.v_certificateNumber = "111111111111111111"
          info.v_nation = "??????";
          info.v_address = "?????????????????????";
          info.v_dw = "??????XXYY??????";
          //info.isv_id = 1;
          delete info.isv_id;
          info.isv_code = "123456";
          info.v_reason = "????????????";

          time = Date.now();

          try {
            resp = await this.webApiSvr.addVisitor(info);
            if (resp && resp.code === 200) success++;
            else failed++;
          } catch (err) {
            console.error(err);
          } finally {
            time = Date.now() - time;
          }

          times.push(time);
        }

        stats = this.statsTime(times);

        this.strText = `??????????????????: {?????????: ${success} ?????????: ${failed} ????????????: ${stats.min} ????????????: ${stats.max
          } ????????????: ${stats.avg}}`;
      } catch (err) {
        this.strText = `?????????????????????!`;
        console.error(err);
      } finally {
        this.stateDb = false;
      }
    }, 0);
  }

  protected btnDbInsStaff_onClick(event: any) {
    this.strText = "";
    this.dataUrl = "";
    this.stateDb = true;

    window.setTimeout(async () => {
      this.appRef.tick();

      try {
        let max: number = 500;
        let time: number;
        let count: number;
        let staffs: TStaff[] = new Array<TStaff>();

        for (let i: number = 1; i <= max; i++) {
          let staff: TStaff = new TStaff();

          staff.type = -1;
          staff.state = 1;
          staff.name = "????????????";
          staff.mobile = "17665320000";
          //staff.jobNum = String(Date.now());
          staff.jobNum = Math.random().toString().split('.')[1].substr(0, 8);
          staff.company = "??????XXYY??????";
          staff.department = "?????????";

          staffs.push(staff);
        }

        time = Date.now();
        await this.dal.save(TStaff, staffs);
        time = Date.now() - time;

        count = await this.dal.count(TStaff);

        this.strText = `????????????????????????: {????????????: ${max} ???????????????: ${count} ?????????: ${time}}`;
      } catch (err) {
        this.strText = `?????????????????????!`;
        console.error(err);
      } finally {
        this.stateDb = false;
      }
    }, 0);
  }

  protected btnDbDelStaff_onClick(event: any) {
    this.strText = "";
    this.dataUrl = "";
    this.stateDb = true;

    window.setTimeout(async () => {
      this.appRef.tick();

      try {
        let res: any;
        let delRes: DeleteResult;
        let time: number;
        let count: number = -1;

        this.strText = `???????????????, ?????????...`;
        time = Date.now();
        res = await this.dal.delete(TStaff, { type: -1 });
        time = Date.now() - time;

        if (typeof res === 'number') {
          this.strText = `??????????????????: ${res}.`;
          return;
        }

        delRes = res as DeleteResult;

        if (!delRes) {
          this.strText = `??????????????????!`;
          return;
        }

        if (typeof delRes.affected === 'number') count = delRes.affected;

        this.strText = `????????????: {???????????????: ${count} ?????????: ${time}}`;
      } catch (err) {
        this.strText = "?????????????????????!";
        console.error(err);
      } finally {
        this.stateDb = false;
      }
    }, 0);
  }

  protected btnDbDelRecord_onClick(event: any) {
    this.strText = "";
    this.dataUrl = "";
    this.stateDb = true;

    window.setTimeout(async () => {
      this.appRef.tick();

      try {
        let res: any;
        let delRes: DeleteResult;
        let time: number;
        let count: number = -1;

        this.strText = `???????????????, ?????????...`;
        time = Date.now();
        res = await this.dal.delete(TRecord, { type: -1 });
        time = Date.now() - time;

        if (typeof res === 'number') {
          this.strText = `??????????????????: ${res}.`;
          return;
        }

        delRes = res as DeleteResult;

        if (!delRes) {
          this.strText = `??????????????????!`;
          return;
        }

        if (typeof delRes.affected === 'number') count = delRes.affected;

        this.strText = `????????????: {???????????????: ${count} ?????????: ${time}}`;
      } catch (err) {
        this.strText = "?????????????????????!";
        console.error(err);
      } finally {
        this.stateDb = false;
      }
    }, 0);
  }

  protected btnCapOcr_onClick(event: any) {
    this.strText = "";
    this.dataUrl = "";

    this.strText = "";
    this.dataUrl = "";

    window.setTimeout(async () => {
      let result: TaskResult;

      try {
        result = await this.nativeApi.execTask(TaskCode.TASK_CAPTURE_OCR_CAM, 0);

        if (!result) {
          this.strText = `??????: ??????????????????!!!`;
          return;
        }

        if (result.Result !== 0) {
          this.strText = `??????: ??????????????????: ${result.Result}`;
          return;
        }

        if (!result.Payload) {
          this.strText = `??????: ?????????????????????!`;
          return;
        }

        this.strText = "????????????!";
        this.dataUrl = "data:image/jpeg;base64," + result.Payload;
      } catch (err) {
        this.strText = `?????????????????????!\r\n${err}`;
        console.error(err);
      }
    }, 0);
  }

  protected btnOcrIdTest_onClick(event: any) {
    this.strText = "";
    this.dataUrl = "";

    window.setTimeout(async () => {
      let result: TaskResult;
      this.stateOcr = true;

      try {
        result = await this.nativeApi.execTask(TaskCode.TASK_START_OCR, 1);

        if (result.Result === 0 && result.Payload) {
          this.strText = JSON.stringify(result.Payload.content);
        } else {
          this.strText = "??????";
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.stateOcr = false;
      }
    }, 0);
  }

  protected btnOcrPpTest_onClick(event: any) {
    this.strText = "";
    this.dataUrl = "";

    window.setTimeout(async () => {
      let result: TaskResult;
      let info: OcrPpInfo;
      let resp: ReadPpResult;

      this.stateOcr = true;

      try {
        result = await this.nativeApi.execTask(TaskCode.TASK_START_OCR, 2);

        if (result.Result === 0 && result.Payload) {
          this.strText = JSON.stringify(result.Payload.content);

          if (result.Payload.content) {
            info = result.Payload.content;

            this.req.sn = info.CardNo;
            this.req.birth = info.Birthday;
            this.req.expiry = info.ValidPeriod;

            result = await this.nativeApi.execTask(
              TaskCode.TASK_READ_PP,
              0,
              JSON.stringify(this.req)
            );

            this.strText += "\r\n\r\n";

            if (result.Result !== 0) {
              this.strText += `????????????????????????:${result.Result}`;
            } else {
              let bmp: string;

              console.log("pp:", result.Payload);

              resp = result.Payload as ReadPpResult;
              bmp = resp.BmpHead;

              this.strText += JSON.stringify(resp.Info);
            }
          }
        } else {
          this.strText = "??????";
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.stateOcr = false;
      }
    }, 0);
  }

  protected btnReadPpTest_onClick(event: any, num: number) {
    this.strText = "";
    this.dataUrl = "";

    window.setTimeout(async () => {
      let result: TaskResult;

      this.stateOcr = true;

      do {
        num--;

        try {
          let resp: ReadPpResult;

          result = await this.nativeApi.execTask(
            TaskCode.TASK_READ_PP,
            0,
            JSON.stringify(this.req)
          );

          if (result.Result !== 0) {
            this.strText = `????????????????????????:${result.Result}`;
          } else {
            console.log("pp:", result.Payload);
            resp = result.Payload;
            this.strText = JSON.stringify(resp.Info);
          }
        } catch (err) {
          console.error(err);
        }

        await sleep(100);
      } while (num > 0);

      this.stateOcr = false;
    }, 0);
  }

  protected btnOcrJzTest_onClick(event: any) {
    this.strText = "";
    this.dataUrl = "";

    window.setTimeout(async () => {
      let result: TaskResult;

      this.stateOcr = true;

      try {
        result = await this.nativeApi.execTask(TaskCode.TASK_START_OCR, 3);

        if (result.Result === 0 && result.Payload) {
          this.strText = JSON.stringify(result.Payload.content);
        } else {
          this.strText = "??????";
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.stateOcr = false;
      }
    }, 0);
  }

  protected async btnTaskTest_onClick(event: any) {
    let promise: Promise<any>;

    this.strText = "";
    this.dataUrl = "";

    try {
      promise = this.nativeApi.execTask(
        TaskCode.TASK_TEST,
        0,
        null,
        null,
        3000
      );

      if (promise) {
        this.globalSvr.showLoading("?????????????????????");
        await promise;
        this.globalSvr.hideLoading();
        this.globalSvr.showAlert("??????", "??????????????????!");
      }
    } catch (err) {
      console.error(err);
      this.globalSvr.hideLoading();
      this.globalSvr.showAlert("??????", "??????????????????!");
    }
  }

  protected async btnFaceTest_onClick(event: any) {
    let promise: Promise<any>;
    let info: InfoData = new InfoData();

    this.strText = "";
    this.dataUrl = "";

    info.name = "????????????";
    info.sex = "????????????";

    try {
      promise = this.nativeApi.execTask(
        TaskCode.TASK_START_ACT_FACE,
        0,
        null,
        JSON.stringify(info),
        3000
      );

      await promise;
    } catch (err) {
      console.error(err);
    }
  }

  protected async btnGetHwInfo_onClick(event: any) {
    let result: TaskResult;

    try {
      result = await this.nativeApi.execTask(TaskCode.TASK_GET_HW_INFO, 0);
      this.strText = JSON.stringify(result.Payload);
    } catch (err) {
      this.strText = `??????????????????????????????: ${err}`;
      console.error(err);
    }

  }

  protected async btnTestSpeak_onClick(event: any) {
    let result: TaskResult;

    try {
      for (let i: number = 0; i < 10; i++) {
        result = await this.nativeApi.execTask(TaskCode.TASK_SPEAK_TEXT, 1, "??????????????????????????????");
        await sleep(3000);
      }

      await sleep(3000);
    } catch (err) {
      this.strText = `??????????????????????????????: ${err}`;
      console.error(err);
    }
  }

  protected async btnTestIc_onClick(event: any) {
    this.globalSvr.showLoading("??????IC????????????????????????...");

    try {
      let start: number = Date.now();
      let resp: InvsCardResponse | null;
      let key: number[];
      let data: number[];

      await this.nativeApi.SetIdReaderPause(true);

      do {
        await sleep(200);

        resp = await this.nativeApi.ICO_FindCard_REQA(2000);
        if (!resp) continue;
        console.log("ICO_FindCard_REQA", resp);
        if (resp.sw3 !== 0x90) continue;


        key = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF];
        resp = await this.nativeApi.ICO_VerifyKeyA(1, key);
        if (!resp) continue;
        console.log("ICO_VerifyKeyA", resp);
        if (resp.sw3 !== 0x90) continue;


        data = [0x11, 0x22, 0x33, 0x44, 0x11, 0x22, 0x33, 0x44, 0x11, 0x22, 0x33, 0x44, 0x11, 0x22, 0x33, 0x44];
        resp = await this.nativeApi.ICO_WriteBlock(0, data);
        if (!resp) continue;
        console.log("ICO_WriteBlock", resp);
        if (resp.sw3 !== 0x90) continue;


        this.globalSvr.hideLoading();
        this.globalSvr.showAlert("??????", `????????????????????????!`);
        return;

      } while (Date.now() - start < 3000);

      this.globalSvr.hideLoading();
      this.globalSvr.showAlert("??????", `????????????!`);
    } catch (err) {
      console.error(err);
    } finally {
      this.nativeApi.SetIdReaderPause(false);
    }
  }
  protected async btntemperature_onClick(event: any) {

  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
