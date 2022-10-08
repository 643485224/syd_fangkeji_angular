import { Component, ApplicationRef, NgZone, ViewChild } from "@angular/core";
import { NavController, NavParams, Select } from "ionic-angular";
import {
  TableViewComponent,
  TableRow,
  TableController,
  ItemButton
} from "../../components/tableview/tableview";
import { GlobalProvider } from "../../providers/global/global";
import {
  NativeApiProvider, TaskCode
} from "../../providers/native-api/native-api";
import { DataAccessLayerProvider } from "../../providers/data-access-layer/data-access-layer";
import { Resolve, Reject } from "../../app/models";
import { TRecord } from '../../entities/trecord';
import { DetailsPage } from "../details/details";
import { formatChsText, sleep, getNowDate } from "../../app/common";
import { FindConditions, Like } from 'typeorm';

const PageSize: number = 10;

@Component({
  selector: "page-setting9",
  templateUrl: "setting9.html"
})
export class Setting9Page {
  @ViewChild("tableView")
  protected table: TableViewComponent;
  protected pageNum: number = 1;
  protected pageMax: number = 1;
  protected count: number = 0;
  protected v_name: string = "";
  protected s_name: string = "";
  protected s_mobile: string = "";
  protected s_jobNum: string = "";
  protected state: number = 0;
  
  protected query: FindConditions<TRecord> = new Object();
  private timer: number = null;
  private pageList: number[] = new Array<number>();
  @ViewChild("selPage")
  protected $select: Select;

  constructor(
    public appRef: ApplicationRef,
    public zone: NgZone,
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeApi: NativeApiProvider,
    public dal: DataAccessLayerProvider
  ) { }

  ionViewDidLoad() {
    this.table.addColHeader("访客姓名", "v_name", "200px");
    this.table.addColHeader("员工姓名", "s_name", "250px");
    this.table.addColHeader("来访事由", "reason", "280px");
    this.table.addColHeader("状态", "state", "120px");
    this.table.addColHeader("来访时间", "visitTime", "420px");
    //this.table.addColHeader("离开时间", "leaveTime", "420px");
    this.table.addColHeader("操作", "#btns", "auto");
    this.table.hookOutputText(
      (row: TableRow, name: string, result: string): string => {
        let item: TRecord;
        let date: Date;

        item = row.source as TRecord;

        switch (name) {
          case "state":
            switch (item.state) {
              case 1:
                return "在访中";
              case 2:
                return "已签离";
            }
            return "未知";
          case "visitTime":
            date = new Date(item.visitTime);
            return formatChsText(date);
          case "leaveTime":
            if (item.leaveTime) {
              date = new Date(item.leaveTime);
              return formatChsText(date);
            }
            return "无";
        }
        return result;
      }
    );
  }

  private createTimer() {
    if (this.timer) return;

    this.timer = window.setInterval(async () => {
      if (this.timer && this.globalSvr.checkTimeout()) {
        if (this.$select) await this.$select.close();
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
    if (this.$select) this.$select.close();
  }

  ionViewWillEnter() {
    this.updatePage();
  }

  private async updatePage() {
    let result: TRecord[] | number;
    let count: number;
    let max: number;
    let rows: TableRow[] = new Array<TableRow>();
    let item: TableRow;

    result = await this.dal.queryPaged(
      TRecord,
      (this.pageNum - 1) * PageSize,
      PageSize,
      this.query,
      { id: "DESC" }
    );

    this.count = count = await this.dal.count(TRecord, this.query);

    max = Math.ceil(count / PageSize);
    this.pageMax = max;
    this.pageList = new Array<number>(max);

    this.table.cleanRow();

    if (typeof result === "number") {
      this.globalSvr.showAlert("错误", `查询来访记录失败[${result}]!`);
      return;
    }

    result.forEach((value: TRecord) => {
      item = new TableRow(value);

      item.addButton(
        "btns",
        "详情",
        "",
        value,
        (event: any, item: ItemButton, tabCtrl: TableController) => {
          this.navCtrl.push(DetailsPage, item.param);
        }
      );

      rows.push(item);
    });

    this.table.bindRow(rows);
  }

 

  protected async onQuery(event: any) {
    try {
      this.globalSvr.showLoading("查询数据中");
      this.pageNum = 1;

      this.query = new Object();

      if (this.v_name) {
        this.query.v_name = Like(`%${this.v_name}%`);
      }

      if (this.s_name) {
        this.query.s_name = Like(`%${this.s_name}%`);
      }

      if (this.s_jobNum) {
        this.query.s_jobNum = Like(`%${this.s_jobNum}%`);
      }

      if (this.s_mobile) {
        this.query.s_mobile = Like(`%${this.s_mobile}%`);
      }

      if (this.state!=0) {
        this.query.state = this.state;
      }

      await this.updatePage();
    } catch (err) {
      console.error(err);
    } finally {
      await sleep(250);
      this.globalSvr.hideLoading();
    }
  }



  protected onPageChange(event: any) {
    this.updatePage();
  }

  protected async onExport($event) {
    try {
      let items: TRecord[] | number;
      let fileName: string;

      this.globalSvr.showLoading("导出数据中");

      this.query = new Object();

      if (this.v_name) {
        this.query.v_name = Like(`%${this.v_name}%`);
      }

      if (this.s_name) {
        this.query.s_name = Like(`%${this.s_name}%`);
      }

      if (this.s_jobNum) {
        this.query.s_jobNum = Like(`%${this.s_jobNum}%`);
      }

      if (this.s_mobile) {
        this.query.s_mobile = Like(`%${this.s_mobile}%`);
      }
      
      if (this.state!=0) {
        this.query.state = this.state;
      }

      items = await this.dal.queryPaged(TRecord, null, null, this.query, {
        id: "ASC"
      });

      if (typeof items === "number") {
        this.globalSvr.showAlert("提示", "导出来访记录失败!");
        return;
      }

      if (!items) {
        this.globalSvr.showAlert("提示", "未查询到来访记录!");
        return;
      }

      fileName = `来访记录导出_${getNowDate()}.xls`;

      await this.nativeApi.execTask(
        TaskCode.TASK_EXPORT_RECORD,
        0,
        fileName,
        JSON.stringify(items)
      );

      await sleep(250);
    } catch (err) {
      console.error(err);
    } finally {
      this.globalSvr.hideLoading();
    }

    this.globalSvr.showAlert("提示", "导出完成!");
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
