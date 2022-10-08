import { Component, ViewChild } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import {
  WebapiProvider,
  JsonResponse,
  StaffInfo,
  PersonList
} from "../../providers/webapi/webapi";
import {
  TableViewComponent,
  TableRow,
  TableController,
  ItemButton
} from "../../components/tableview/tableview";
import { sleep } from "../../app/common";
import { Onsite4Page } from "./onsite4";
import { WebError } from '../../providers/webapi/webapi';

@Component({
  selector: "page-onsite3",
  templateUrl: "onsite3.html"
})
export class Onsite3Page {  // 选择被访人页面
  protected strName: string = "";
  protected strPhone: string = "";
  protected strJobNum: string = "";
  @ViewChild("tableView")
  table: TableViewComponent;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public webApiSvr: WebapiProvider
  ) { }

  ionViewDidLoad() {
    //this.table.addColHeader("编号", "id", "100px");
    this.table.addColHeader("姓名", "name", "160px");
    this.table.addColHeader("性别", "sex", "120px");
    this.table.addColHeader("工号", "code", "180px");
    this.table.addColHeader("电话", "phone", "200px");
    //this.table.addColHeader("公司", "company", "220px");
    this.table.addColHeader("部门", "deptName", "220px");
    this.table.addColHeader("位置", "location", "220px");
    this.table.addColHeader("操作", "#btns", "auto");
    this.table.hookOutputText(
      (row: TableRow, name: string, result: string): string => {
        if (name === "sex") {
          switch (result) {
            case "1":
              return "男";
            case "2":
              return "女";
            default:
              return result;
          }
        }

        return result;
      }
    );
  }

  protected async onQuery(event: any) {  // 点击搜索被访人按钮
    let resp: JsonResponse;
    let list: PersonList;
    let items: TableRow[] = new Array<TableRow>();
    let item: TableRow;

    if (!this.strName && !this.strPhone && !this.strJobNum) {
      this.globalSvr.showAlert("警告", "必须至少填写一项查询条件!");
      return;
    }

    try {
      this.globalSvr.showLoading("查询被访人中");

      resp = await this.webApiSvr.getInterviewee(
        this.strName,
        this.strPhone,
        this.strJobNum
      );
    } catch (err) {
      console.error(err);
      let errMsg: string;

      if (err instanceof WebError && err.textStatus === "timeout") {
        errMsg = `网络请求超时!`;
      } else {
        errMsg = `提交登记信息时出现错误!`;
      }

      this.globalSvr.showAlert("警告", errMsg);
      return;
    } finally {
      await sleep(550);
      this.globalSvr.hideLoading();
    }

    if (!resp) {
      this.globalSvr.showAlert("警告", "查询被访人失败!");
      return;
    }

    if (resp.code !== 200) {
      this.globalSvr.showAlert(
        "警告",
        `查询被访人失败[${this.webApiSvr.getErrorMsg(resp.code)}]!`
      );
      return;
    }

    list = resp.info;

    if (!list || !list.personList || list.personList.length <= 0) {
      this.globalSvr.showAlert("提示", `未查询到符合条件的人员!`);
      return;
    }

    for (let i: number = 0; i < list.personList.length; i++) {
      item = new TableRow(list.personList[i]);

      item.addButton(  // 添加选择按钮
        "btns",
        "选择",
        "",
        list.personList[i],
        (event: any, item: ItemButton, tabCtrl: TableController) => {
          let mode: number = 1;

          this.globalSvr.onsite.staff = item.param;

          if (this.globalSvr.onsite.b64head) mode = 2;

          this.navCtrl.push(Onsite4Page, { //跳转现场登记 - 抓拍人脸页面
            params: {  // 传递params对象
              mode: mode,
              bitmap: this.globalSvr.onsite.b64head,
              offline: false,
              visitorInfo: this.globalSvr.onsite.visitor,
              staffInfo: this.globalSvr.onsite.staff,
              idcard: this.globalSvr.onsite.idcard
            }
          });
        }
      );

      items.push(item);
    }

    this.table.bindRow(items);
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
