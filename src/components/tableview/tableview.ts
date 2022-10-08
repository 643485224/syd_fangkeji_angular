import {
  Component,
  Input,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild,
  ElementRef,
  NgZone,
  EventEmitter,
  ApplicationRef
} from "@angular/core";

export class TableController {
  me: TableViewComponent;

  constructor(me: TableViewComponent) {
    this.me = me;
  }
}

export class TableHeader {
  title: string = "";
  name: string = "";
  style: any = new Object({ width: "auto", 'white-space': 'nowrap' });

  get width(): string | number {
    if (this.style && this.style.width) return this.style.width;
    return null;
  }

  set width(value: string | number) {
    if (!this.style) this.style = new Object({ width: "auto" });

    if (typeof(value) === "number") {
      if (value === 0) this.style.width = 'auto';
      else this.style.width = String(value) + "%";
    } else {
      this.style.width = String(value);
    }
  }
}

export class ItemButton {
  title: string = "";
  id: number = 0;
  color: string = "";
  param: any = null;
  click: onButtonClick = null;
}

export class TableCol {
  name: string = "";
  //0: text,  1: number
  type: number;
  text: string = "";
  click: onCellClick = null;
  dblclick: onCellClick = null;
  buttons: ItemButton[] = null;
  style: any = new Object();
  class: any = new Object();

  constructor(
    name: string,
    type: number,
    text?: string,
    click?: onCellClick,
    dblclick?: onCellClick
  ) {
    this.name = name;
    this.type = type;
    if (text) this.text = text;
    if (click) this.click = click;
    if (dblclick) this.dblclick = dblclick;
  }

  public addButton(button: ItemButton): number {
    if (!this.buttons) this.buttons = new Array<ItemButton>();

    return this.buttons.push(button);
  }

  public setClickEvent(click: onCellClick): onCellClick {
    let result = this.click;

    this.click = click;
    return result;
  }
}

export class TableRow {
  //选中状态
  checked: boolean = false;

  //状态
  state: number = 0;

  //style
  style: any = new Object();

  //类
  class: string = "";

  //数据源
  source: any = new Object();

  //参数
  param: any = new Object();

  //子列数组
  columns: TableCol[] = new Array<TableCol>();

  constructor(data_source?: any) {
    if (data_source) this.source = data_source;
  }

  //设置列: 文本
  public setCol_String(name: string, title: string) {
    this.source[name] = new String(title);
  }

  //设置列: 数字
  public setCol_Number(name: string, num: number) {
    this.source[name] = new Number(num);
  }

  //添加列
  public addColumn(column: TableCol): TableRow {
    this.columns.push(column);
    return this;
  }

  //设置列: 按钮
  public addButton(
    name: string,
    title: string,
    color: string,
    param: any,
    click: onButtonClick
  ): TableRow {
    let button: ItemButton = new ItemButton();
    let column: TableCol;

    if (name.substr(0, 1) === "#") name = name.substr(1);

    column = this.getColumn(name);

    if (!column) {
      column = new TableCol(name, 101);
      this.columns.push(column);
    }

    button.title = title;
    button.color = color;
    button.param = param;
    button.click = click;

    column.addButton(button);

    return this;
  }

  //获取列对象
  public getColumn(name: string): TableCol {
    return this.columns.find(o => o.name === name);
  }
}

export class TableObject {
  //column
  headers: TableHeader[] = new Array<TableHeader>();

  //row
  rows: TableRow[] = new Array<TableRow>();

  public addCol(title: string, name: string, width: string | number): number {
    let result: number = -1;
    let tabHdr: TableHeader = new TableHeader();

    tabHdr.title = title;
    tabHdr.name = name;

    tabHdr.width = width;

    result = this.headers.push(tabHdr);
    return result;
  }

  public addRow(item: TableRow): number {
    if (item === null || item === undefined) return -1;

    let result: number = -2;
    result = this.rows.push(item);
    return result;
  }

  /**
   * @param {TableRow} items
   * @returns {number}  : 0 is ok
   *
   * @memberof TableObject
   */
  public bindRow(items: TableRow[]): boolean {
    if (!items) return false;

    this.rows = items;
    return true;
  }

  public bindAny(items: any[]): boolean {
    if (!items || items.length <= 0) return false;

    let newItems: TableRow[] = new Array<TableRow>(items.length);

    for (let i: number = 0; i < items.length; i++) {
      newItems[i] = new TableRow();
      newItems[i].source = items[i];
    }

    this.rows = newItems;
    return true;
  }

  public cleanRow() {
    this.rows = new Array<TableRow>();
  }
}

export class LayPageEvent {
  pagesize: number;
  pagenum: number;
  first: boolean;

  constructor(pagesize?: number, pagenum?: number, first?: boolean) {
    this.pagesize = pagesize;
    this.pagenum = pagenum;
    this.first = first;
  }
}

export type getText = (row: TableRow, name: string, result: string) => string;
export type getObject = (
  row: TableRow,
  name: string,
  result: TableCol
) => TableCol;
export type onButtonClick = (
  event: any,
  item: ItemButton,
  tabCtrl: TableController
) => any;
export type onCellClick = (
  event: any,
  row: TableRow,
  col: TableCol,
  tabCtrl: TableController
) => Promise<any>;

@Component({
  selector: "tableview",
  templateUrl: "tableview.html"
})
export class TableViewComponent {
  @Input() itemcount: number = 0;
  @Input() pagesize: number = 10;
  @Input() pageshow: number = 0;
  @Input() pagectrl: boolean = false;
  @Input() multiple: boolean = false;
  @Input() pagenum: number = 1;
  @Input() pagecount: number = 1;
  @Input() groups: number = 5;
  @Output() pagechange: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  layevent: EventEmitter<LayPageEvent> = new EventEmitter<LayPageEvent>();
  @ViewChild("laypage") laypage: ElementRef;
  @ViewChild("tvHeader") tvHeader: ElementRef;
  @ViewChild("tvMend") tvMend: ElementRef;
  @ViewChild("tvBody") tvBody: ElementRef;

  protected current: TableCol;
  protected allChecked: boolean = false;
  protected table: TableObject = new TableObject();
  protected cbGetText: getText = null;
  protected cbGetObject: getObject = null;
  protected readonly defaultCell: TableCol = new TableCol(name, 0, " ");

  constructor(private zone: NgZone, private appRef: ApplicationRef) {}

  public isEmptyColHdr(): boolean {
    if (this.table.headers.length === 0) return true;

    return false;
  }

  protected ngAfterViewInit() {
    let elemHeader: HTMLElement = this.tvHeader.nativeElement;
    let elemMend: HTMLElement = this.tvMend.nativeElement;

    elemMend.style.height = elemHeader.clientHeight + 'px';
  }

  //添加列头
  public addColHeader(
    title: string,
    name: string,
    width: string | number
  ): TableViewComponent {
    this.table.addCol(title, name, width);
    return this;
  }

  //绑定行数据
  public bindRow(items: TableRow[]): boolean {
    let result: boolean;

    result = this.table.bindRow(items);

    this.refresh();
    return result;
  }

  //绑定行数据
  public bindAny(items: any[]): boolean {
    let result: boolean;

    result = this.table.bindAny(items);

    this.refresh();
    return result;
  }

  //清理行
  public cleanRow() {
    this.table.cleanRow();
    this.appRef.tick();
    return;
  }

  public updatePageSize() {
    if (this.pagesize === this.table.rows.length) return;

    let tabItems: TableRow[] = new Array<TableRow>(this.pagesize);
    let numMin: number =
      tabItems.length > this.table.rows.length
        ? this.table.rows.length
        : tabItems.length;

    for (let i: number = 0; i < numMin; i++) {
      tabItems[i] = new TableRow();
      tabItems[i] = this.table.rows[i];
    }

    this.table.rows = tabItems;
    this.appRef.tick();
  }

  public hookOutputText(cbfunc: getText) {
    this.cbGetText = cbfunc;
  }

  public hookOutputObject(cbfunc: getObject) {
    this.cbGetObject = cbfunc;
  }

  public async refresh() {
    await Promise.all(
      this.table.rows.map((row: TableRow) => {
        return new Promise(async (resolve, reject) => {
          await Promise.all(
            this.table.headers.map((header: TableHeader) => {
              return new Promise((resolve2, reject2) => {
                this.updateColumn(row, header.name);
                resolve2(header);
              });
            })
          );
          resolve(row);
        });
      })
    );

    this.appRef.tick();
  }

  public getSelected(): any[] {
    let array: Array<any> = new Array<any>();

    for (let i: number = 0; i < this.table.rows.length; i++) {
      if (this.table.rows[i].checked) array.push(this.table.rows[i].source);
    }

    return array;
  }


  //属性改变事件
  protected ngOnChanges(changes: SimpleChanges) {
    let mychange: SimpleChange;
    let updatePage: boolean = false;

    if ('itemcount' in changes) {
      mychange = changes['itemcount'];

      this.itemcount = Number(mychange.currentValue);
      updatePage = true;
    }

    //页大小
    if ('pagesize' in changes) {
      mychange = changes['pagesize'];

      this.pagesize = Number(mychange.currentValue);
      this.updatePageSize();
      updatePage = true;
    }

    //分页控制的显示样式
    if ('pageshow' in changes) {
      mychange = changes['pageshow'];

      this.pageshow = Number(mychange.currentValue);
      updatePage = true;
    }

    //组数量
    if ('groups' in changes) {
      mychange = changes['groups'];

      this.groups = Number(mychange.currentValue);
      updatePage = true;
    }

    //页号
    if ('pagenum' in changes) {
      mychange = changes['pagenum'];

      //如果是layui分页,就禁止外部修改页号
      if (this.pageshow === 2) {
        if (!mychange.previousValue) this.pagenum = 1;
        else this.pagenum = Number(mychange.previousValue);
      } else {
        this.pagenum = Number(mychange.currentValue);
      }
    }

    if (updatePage) {

    }
  }

  protected getItemClass(item: TableRow): string {
    if (!item) return "";

    let strClass: string = "";

    if ("class" in item && item.class) strClass = item.class;
    return strClass;
  }

  protected findColumn(row: TableRow, name: string): number {
    if (!row || !row.columns) return -1;
    if (name.substr(0, 1) === "#") name = name.substr(1);

    return row.columns.findIndex((value: TableCol) => {
      return value.name === name;
    });
  }

  protected checkboxAll_click(event: any) {
    event.stopPropagation();

    this.allChecked = !this.allChecked;

    this.table.rows.forEach((elem: TableRow) => {
      elem.checked = this.allChecked;
    });
  }

  protected checkbox_click(event: any, item: TableRow) {
    event.stopPropagation();

    item.checked = !item.checked;

    for (let i: number = 0; i < this.table.rows.length; i++) {
      if (this.table.rows[i].checked == false) {
        this.allChecked = false;
        return;
      }
    }

    this.allChecked = true;
  }

  protected setCurrent(col: TableCol) {
    this.current = col;
  }

  protected updateColumn(row: TableRow, name: string): TableCol {
    let result: TableCol;

    if (!row) return this.defaultCell;
    if (!row.source) return this.defaultCell;
    //if (!(name in row.source)) return this.defaultCell;

    //查找现有表格对象
    result = row.getColumn(name);

    if (!result) {
      result = new TableCol(name, 0);
      row.addColumn(result);

      if (name in row.source) {
        //如果数据源类型为string或者number
        switch (typeof row.source[name]) {
          case "string":
            result.text = row.source[name];
            result.type = 1;
            break;
          case "number":
            result.text = String(row.source[name]);
            result.type = 2;
            break;
        }
      } else {
        result.text = "";
        result.type = 1;
      }
    }

    try {
      //如果存在hook列对象的函数
      if (this.cbGetObject) {
        result = this.cbGetObject(row, name, result);
      }

      //如果存在hook文本的函数
      if (this.cbGetText) {
        result.text = this.cbGetText(row, name, result.text);
      }
    } catch (error) {
      console.error(error);
    }

    if (result) return result;
    else return this.defaultCell;
  }

  protected getColumn(row: TableRow, name: string): TableCol {
    if (!row || !row.columns) return this.defaultCell;
    if (name.substr(0, 1) === "#") name = name.substr(1);

    let index: number = row.columns.findIndex((value: TableCol) => {
      return value.name === name;
    });

    if (index < 0) return this.defaultCell;
    return row.columns[index];
  }

  protected getButtons(row: TableRow, name: string): ItemButton[] {
    if (!row) return new Array<ItemButton>();
    if (name.substr(0, 1) !== "#") return new Array<ItemButton>();

    let column: TableCol;

    name = name.substr(1);
    column = row.getColumn(name);

    if (!column) return new Array<ItemButton>();

    return column.buttons;
  }

  protected page_onClick(event, id) {
    this.pagechange.emit(id);
  }

  protected button_onClickStub(event, item: ItemButton) {
    if (event && event.stopPropagation) event.stopPropagation();
    if (!item) return;
    if (!(item instanceof ItemButton)) return;
    if (item.click) item.click(event, item, new TableController(this));
  }

  protected cell_onClickStub(event, row: TableRow, col: TableCol) {
    if (event && event.stopPropagation) event.stopPropagation();
    if (!row || !col) return;
    if (col.click) col.click(event, row, col, new TableController(this));
  }

  protected cell_onDblClickStub(event, row: TableRow, col: TableCol) {
    if (event && event.stopPropagation) event.stopPropagation();
    if (!row || !col) return;
    if (col.dblclick) col.dblclick(event, row, col, new TableController(this));
  }
}
