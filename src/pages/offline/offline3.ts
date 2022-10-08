import { Component, ViewChild } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import {
  TableViewComponent,
  TableRow,
  TableController,
  ItemButton
} from "../../components/tableview/tableview";
import { sleep } from "../../app/common";
import { Offline4Page } from "./offline4";
import { DataAccessLayerProvider } from "../../providers/data-access-layer/data-access-layer";
import { TStaff } from "../../entities/tstaff";
import { Like } from "typeorm";

const PageSize: number = 20;

@Component({
  selector: "page-offline3",
  templateUrl: "offline3.html"
})
export class Offline3Page { // 选择被访人页面
  protected strName: string = "";
  protected strPhone: string = "";
  protected strJobNum: string = "";
  protected count: number = 0;
  protected pageNum: number = 1;
  protected pageMax: number = 1;
  protected list: TStaff[];
  @ViewChild("tableView")
  table: TableViewComponent;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public dal: DataAccessLayerProvider
  ) { }

  ionViewDidLoad() {
    this.table.addColHeader("姓名", "name", "200px");
    this.table.addColHeader("性别", "sex", "120px");
    this.table.addColHeader("工号", "jobNum", "220px");
    this.table.addColHeader("电话", "mobile", "200px");
    this.table.addColHeader("公司", "company", "auto");
    this.table.addColHeader("操作", "#btns", "200px");
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

  protected async onQuery(event: any) { // 点击搜索被访人按钮触发该事件
    let res: TStaff[] | number;

    try {
      this.globalSvr.showLoading("查询被访人中");

      res = await this.dal.queryPaged(TStaff, 0, 3000, {
        name: Like(`%${this.strName}%`),
        mobile: Like(`%${this.strPhone}%`),
        jobNum: Like(`%${this.strJobNum}%`)
      });

    } catch (err) {
      console.error(err);
    } finally {
      await sleep(550);
      this.globalSvr.hideLoading();
    }

    if (typeof res === "number") {
      this.globalSvr.showAlert("警告", `查询被访人失败[${res}]!`);
      return;
    }

    this.list = res as TStaff[];

    this.count = this.list.length;
    this.pageMax = Math.ceil(this.count / PageSize);
    this.pageNum = 1;

    this.updatePage();
  }

  protected updatePage() {
    this.table.cleanRow();

    let items: TableRow[] = new Array<TableRow>();
    let item: TableRow;

    for (let i: number = (this.pageNum - 1) * PageSize; i < this.pageNum * PageSize && i < this.list.length; i++) {
      item = new TableRow(this.list[i]);

      item.addButton( // 添加选择按钮
        "btns",
        "选择",
        "",
        this.list[i],
        (event: any, item: ItemButton, tabCtrl: TableController) => {
          let mode: number = 1;

          this.globalSvr.offline.staff = this.list[i];

          this.navCtrl.push(Offline4Page);  //进入抓拍人脸页面
        }
      );

      items.push(item);
    }
    this.table.bindRow(items);
  }

  protected onPageCtrl(id: number) {
    switch (id) {
      case 1: // 点击上一页按钮
        this.pageNum--;
        this.updatePage(); // 更新页面
        break;
      case 2:// 点击下一页按钮
        this.pageNum++;
        this.updatePage(); // 更新页面
        break;
    }
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
