import { Component, ApplicationRef, NgZone, ViewChild } from "@angular/core";
import { NavController, NavParams, Select } from "ionic-angular";
import { DataAccessLayerProvider } from "../../providers/data-access-layer/data-access-layer";
import { TaskResult } from "../../providers/native-api/native-api";
import {
  TableViewComponent,
  TableRow,
  TableController,
  ItemButton
} from "../../components/tableview/tableview";
import { TStaff } from "../../entities/tstaff";
import {
  NativeApiProvider,
  TaskCode
} from "../../providers/native-api/native-api";
import { Resolve, Reject } from "../../app/models";
import { GlobalProvider } from "../../providers/global/global";
import { sleep } from "../../app/common";
import { Like, FindConditions } from 'typeorm';

const PageSize: number = 20;
const MaxImportLimit: number = 3000;

interface StaffItem {
  name: string;
  jobNum: string;
  mobile: string;
  sex: string;
  company: string;
  department: string;
}

interface ImportResult {
  result: number;
  content: StaffItem[];
}

@Component({
  selector: "page-setting8",
  templateUrl: "setting8.html"
})
export class Setting8Page {
  @ViewChild("tableView")
  protected table: TableViewComponent;
  protected pageNum: number = 1;
  protected pageMax: number = 1;
  protected strName: string = "";
  protected strPhone: string = "";
  protected strJobNum: string = "";
  protected count: number = 0;
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
    this.table.addColHeader("Id", "id", "100px");
    this.table.addColHeader("姓名", "name", "200px");
    this.table.addColHeader("工号", "jobNum", "224px");
    this.table.addColHeader("手机", "mobile", "266px");
    this.table.addColHeader("性别", "sex", "110px");
    this.table.addColHeader("公司", "company", "300px");
    this.table.addColHeader("部门", "department", "auto");
    this.table.addColHeader("操作", "#btns", "120px");

    this.table.hookOutputText(
      (row: TableRow, name: string, result: string): string => {
        if (name === "sex") {
          switch (result) {
            case "1":
              return "男";
            case "2":
              return "女";
            default:
              return "未知";
          }
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
    this.update();
  }

  private async update() {
    try {
      this.globalSvr.showLoading("查询数据中...");
      await this.updatePage();
    } catch (err) {
      console.error(err);
    } finally {
      await sleep(550);
      this.globalSvr.hideLoading();
    }
  }

  private async updatePage() {
    let items: TableRow[] = new Array<TableRow>();
    let item: TableRow;
    let result: TStaff[] | number;
    let count: number;
    let max: number;
    let list: TStaff[];
    let find: FindConditions<TStaff> = {};

    if (this.strName) find.name = Like(`%${this.strName}%`);
    if (this.strPhone) find.mobile = Like(`%${this.strPhone}%`);
    if (this.strJobNum) find.jobNum = Like(`%${this.strJobNum}%`);

    this.count = count = await this.dal.count(TStaff, find);

    max = Math.ceil(count / PageSize);
    this.pageMax = max;
    this.pageList = new Array<number>(max);

    result = await this.dal.queryPaged(
      TStaff,
      (this.pageNum - 1) * PageSize,
      PageSize,
      find
    );

    this.table.cleanRow();

    if (typeof result === "number") {
      this.globalSvr.showAlert("错误", `查询员工数据失败[${result}]!`);
      return;
    }

    list = result as TStaff[];

    for (let i: number = 0; i < list.length; i++) {
      item = new TableRow(list[i]);

      this.globalSvr.updateActiveTime();

      item.addButton(
        "btns",
        "删除",
        "",
        list[i],
        async (event: any, item: ItemButton, tabCtrl: TableController) => {
          let bool: boolean

          bool = await this.globalSvr.showConfirm("警告", `确认要删除员工[${list[i].name}]?`);

          if (bool) {
            try {
              await this.dal.remove(TStaff, list[i]);
            } catch (err) {
              console.error(err);
            }

            this.pageNum = 1;
            this.update();
          }
        }
      );

      items.push(item);
    }

    this.table.bindRow(items);
  }

  protected onPageCtrl(id: number) {
    switch (id) {
      case 1:
        if (this.pageNum > 0) this.pageNum--;
        this.update();
        break;
      case 2:
        if (this.pageNum < this.pageMax) this.pageNum++;
        this.update();
        break;
    }
  }

  protected onPageChange(event: any) {
    this.updatePage();
  }

  protected async btnExportTpl_onClick($event) {
    try {
      await this.nativeApi.execTask(TaskCode.TASK_EXPORT_TPL, 0);
    } catch (err) {
      console.error(err);
    } finally {
      this.globalSvr.showAlert("提示", "导出模板完成");
    }
  }

  private updateStaff(staff: TStaff, item: StaffItem) {
    if (!staff || !item) return;

    staff.name = item.name;

    switch (item.sex.trim()) {
      case "男":
      case "M":
        staff.sex = 1;
        break;
      case "女":
      case "F":
        staff.sex = 2;
        break;
      default:
        staff.sex = 0;
        break;
    }

    staff.jobNum = item.jobNum;
    staff.mobile = item.mobile;
    staff.company = item.company;
    staff.department = item.department;
  }

  protected asyncSave(item: StaffItem): Promise<void> {
    let promise: Promise<void> = new Promise<void>(
      (resolve: Resolve<void>, reject: Reject) => {
        window.setTimeout(async () => {
          try {
            let res: TStaff | number;

            res = await this.dal.queryOne(TStaff, { jobNum: item.jobNum }, undefined);

            // 判断相同工号，更新数据
            if (res && typeof res === "object") {
              this.updateStaff(res, item);
              await this.dal.save(TStaff, res);
              return;
            }
          } catch (err) {
            console.error(err);
          } finally {
            resolve();
          }

          try {
            let staff: TStaff = new TStaff();

            this.updateStaff(staff, item);
            await this.dal.save(TStaff, staff);
            return;
          } catch (err) {
            console.error(err);
          } finally {
            resolve();
          }
        }, 1);
      }
    );

    return promise;
  }

  protected async onQuery(event: any) {
    try {
      this.pageNum = 1;
      this.update();
    } catch (err) {
      console.error(err);
    }
  }

  protected async btnImport_onClick($event) {
    let result: TaskResult;
    let dataset: TStaff[] = new Array<TStaff>();
    let res: any;
    let current: TStaff[];
    let count: number = 0;

    result = await this.nativeApi.execTask(
      TaskCode.TASK_IMPORT_STAFF,
      0,
      "员工数据表.xls"
    );

    if (result.Result === 0 && result.Payload) {
      let importResult: ImportResult = result.Payload;

      if (importResult.result === 0 && importResult.content.length) {
        this.globalSvr.showLoading("导入数据中");

        try {
          importResult.content.forEach(item => {
            let i: number;

            if (!item) return;
            if (!item.name) return;
            if (!item.jobNum) return;

            this.globalSvr.updateActiveTime();

            //导入数据查重
            i = dataset.findIndex((s: TStaff) => {
              if (s.jobNum === item.jobNum) {
                console.log("重复了", s.jobNum);
                return true;
              }
              return false;

            });

            if (i !== -1) {
              this.updateStaff(dataset[i], item);
            } else {
              let newStaff: TStaff = new TStaff();

              this.updateStaff(newStaff, item);
              dataset.push(newStaff);
            }
          });

          //获取现有数据
          res = await this.dal.query(TStaff);

          if (typeof current !== 'number') {
            let i: number;

            current = res as TStaff[];

            //导入数据与现有数据查重
            dataset.forEach((item: TStaff, index: number) => {
              i = current.findIndex((s: TStaff) => {
                if (s.jobNum === item.jobNum) return true;
                return false;
              });

              //数据更新
              if (i !== -1) {
                dataset[index].id = current[i].id;
              }
            });
          }

          count = await this.dal.count(TStaff);

          if (count >= MaxImportLimit) {
            this.globalSvr.showAlert("提示", `员工数量已达最大限制[${MaxImportLimit}],无法导入`);
            return;
          }

          //裁剪数组长度
          dataset = dataset.slice(0, MaxImportLimit - count);

          await this.dal.save(TStaff, dataset);
          await sleep(50);
          this.pageNum = 1;
          this.update();
          this.globalSvr.showAlert("提示", "导入数据完成");
        } catch (err) {
          this.globalSvr.showAlert("提示", "写入数据时出现异常!");
          console.error(err);
        } finally {
          this.globalSvr.hideLoading();
        }
      }
    } else {
      this.globalSvr.showAlert("警告", "导入数据失败!");
    }
  }

  protected async btnExport_onClick($event) {
    try {
      let items: TStaff[] | number;

      this.globalSvr.showLoading("导出数据中");

      items = await this.dal.queryPaged(TStaff, null, null, null, {
        id: "ASC"
      });

      if (typeof items === "number") {
        this.globalSvr.showAlert("提示", "导出员工失败!");
        return;
      }

      if (!items) {
        this.globalSvr.showAlert("提示", "未查询到员工数据!");
        return;
      }

      await this.nativeApi.execTask(
        TaskCode.TASK_EXPORT_STAFF,
        0,
        "员工数据表_导出.xls",
        JSON.stringify(items)
      );
    } catch (err) {
      console.error(err);
    } finally {
      await sleep(250);
      this.globalSvr.hideLoading();
    }

    this.globalSvr.showAlert("提示", "导出完成!");
  }

  protected async btnDelAll_onClick($event: any) {
    try {
      let bool: boolean;

      bool = await this.globalSvr.showConfirm("警告", "请确认是否删除全部员工数据!");
      if (!bool) return;

      bool = await this.globalSvr.showConfirm("警告", "请再次确认是否删除全部员工数据!");
      if (!bool) return;

      this.globalSvr.showLoading("删除全部员工中");
      await this.dal.deleteAll(TStaff, "id");
    } catch (err) {
      console.error(err);
    } finally {
      this.globalSvr.hideLoading();
    }
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
