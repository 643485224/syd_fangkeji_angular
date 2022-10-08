export type Resolve<T> = (value?: T | PromiseLike<T>) => void;
export type Reject = (reason?: any) => void;

export class InfoData {
  name: string = "";
  sex: string = "";
  folk: string = "";
  credNum: string = "";
  reason: string = "";
  isv_name: string = "";
  isv_deptName: string = "";
}

//项目列表
export class ListItem {
  id: number;
  name: string;
}

export const listFolks: ListItem[] = [
  { id: 0, name: "未指定" },
  { id: 1, name: "汉" },
  { id: 2, name: "蒙古" },
  { id: 3, name: "回" },
  { id: 4, name: "藏" },
  { id: 5, name: "维吾尔" },
  { id: 6, name: "苗" },
  { id: 7, name: "彝" },
  { id: 8, name: "壮" },
  { id: 9, name: "布依" },
  { id: 10, name: "朝鲜" },
  { id: 11, name: "满" },
  { id: 12, name: "侗" },
  { id: 13, name: "瑶" },
  { id: 14, name: "白" },
  { id: 15, name: "土家" },
  { id: 16, name: "哈尼" },
  { id: 17, name: "哈萨克" },
  { id: 18, name: "傣" },
  { id: 19, name: "黎" },
  { id: 20, name: "傈僳" },
  { id: 21, name: "佤" },
  { id: 22, name: "畲" },
  { id: 23, name: "高山" },
  { id: 24, name: "拉祜" },
  { id: 25, name: "水" },
  { id: 26, name: "东乡" },
  { id: 27, name: "纳西" },
  { id: 28, name: "景颇" },
  { id: 29, name: "柯尔克孜" },
  { id: 30, name: "土" },
  { id: 31, name: "达斡尔" },
  { id: 32, name: "仫佬" },
  { id: 33, name: "羌" },
  { id: 34, name: "布朗" },
  { id: 35, name: "撒拉" },
  { id: 36, name: "毛南" },
  { id: 37, name: "仡佬" },
  { id: 38, name: "锡伯" },
  { id: 39, name: "阿昌" },
  { id: 40, name: "普米" },
  { id: 41, name: "塔吉克" },
  { id: 42, name: "怒" },
  { id: 43, name: "乌孜别克" },
  { id: 44, name: "俄罗斯" },
  { id: 45, name: "鄂温克" },
  { id: 46, name: "德昂" },
  { id: 47, name: "保安" },
  { id: 48, name: "裕固" },
  { id: 49, name: "京" },
  { id: 50, name: "塔塔尔" },
  { id: 51, name: "独龙" },
  { id: 52, name: "鄂伦春" },
  { id: 53, name: "赫哲" },
  { id: 54, name: "门巴" },
  { id: 55, name: "珞巴" },
  { id: 56, name: "基诺" },
  { id: 59, name: "穿青人" },
  { id: 101, name: "外国民族" },
  { id: 102, name: "外籍华人" },
  { id: 103, name: "华侨" },
  { id: 104, name: "其他" }
];
