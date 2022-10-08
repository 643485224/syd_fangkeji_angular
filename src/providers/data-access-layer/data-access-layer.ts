import { Injectable } from "@angular/core";
import {
  createConnection,
  Connection,
  ObjectLiteral,
  RemoveOptions,
  SaveOptions,
  FindConditions,
  DeleteResult,
  FindManyOptions,
  ObjectID
} from "typeorm";
import { CordovaConnectionOptions } from "typeorm/driver/cordova/CordovaConnectionOptions";
import { RepositoryManager } from './repositoryManager';
import { TVisitor } from "../../entities/tvisitor";
import { TRecord } from "../../entities/trecord";
import { TCredential } from "../../entities/tcredential";
import { TStaff } from "../../entities/tstaff";
import { TTest } from "../../entities/ttest";

@Injectable()
export class DataAccessLayerProvider {
  private $isConnected: boolean = false;
  private $connect: Connection = null;
  private $manager: RepositoryManager<Function> = new RepositoryManager();
  private readonly entities: Function[] = [TStaff, TVisitor, TCredential, TRecord, TTest];

  constructor() {
    try {
      this.entities.forEach((item: Function) => {
        this.$manager.addEntity(<any>item);
      });
    } catch (err) {
      console.error(err);
    }
  }

  public async init() {
    if (this.$connect) return;

    try {
      let $entities: any = {};
      let options: CordovaConnectionOptions;

      options = {
        type: "cordova",
        database: "vmsdb",
        location: "default",
        logging: ["error", "schema"],
        synchronize: true,
        //cache: true,
        entities: this.$manager.entities
      };

      this.$connect = await createConnection(options);

      this.$isConnected = true;
      this.$manager.initRepository(this.$connect);
      console.log("DAL: initRepository OK!");

      this.entities.forEach((item: Function) => {
        $entities[item.name] = item;
      });

      (<any>window).$orm = this.$manager;
      (<any>window).$entities = $entities;
    } catch (err) {
      console.error("DAL: initRepository Failed!", err);
      throw err;
    }
  }

  public async synchronize() {
    if (this.$connect) {
      await this.$connect.synchronize();
    }
  }

  public async uninit() {
    if (this.$connect) {
      await this.$connect.close();
      this.$connect = null;
    }
  }

  public get isConnected(): boolean {
    return (this.$connect) ? this.$connect.isConnected : this.$isConnected;
  }

  /**
   * 保存对象实例, 如果主键存在则update，否则insert
   * @param Constructor
   * @param obj
   * @param options
   */
  public async save<T>(
    Constructor: { new(): T },
    obj: T | T[],
    options?: SaveOptions
  ): Promise<T | number> {
    return await this.$manager.save(Constructor, obj, options);
  }

  public async remove<T>(
    Constructor: { new(): T },
    obj: T,
    options?: RemoveOptions
  ): Promise<T | number> {
    return await this.$manager.remove(Constructor, obj, options);
  }

  public async removes<T>(
    Constructor: { new(): T },
    obj: T[],
    options?: RemoveOptions
  ): Promise<T[] | number> {
    return await this.$manager.removes(Constructor, obj, options);
  }

  public async query<T>(
    Constructor: { new(): T },
    where?: FindConditions<T> | ObjectLiteral | string,
    order?: { [P in keyof T]?: "ASC" | "DESC" | 1 | -1 },
    cache?: boolean | number | {
      id: any;
      milliseconds: number;
    }): Promise<T[] | number> {
    return await this.$manager.query(Constructor, where, order, cache);
  }

  public async queryOne<T>(
    Constructor: { new(): T },
    where?: FindConditions<T> | ObjectLiteral | string,
    order?: { [P in keyof T]?: "ASC" | "DESC" | 1 | -1 },
    cache?: boolean | number | {
      id: any;
      milliseconds: number;
    }
  ): Promise<T | number> {
    return await this.$manager.queryOne(Constructor, where, order, cache);
  }

  /**
   * 分页查询
   * @param Constructor 实例类型
   * @param offset 开始偏移
   * @param max 最大数量
   * @param where WHERE 表达式
   * @param order 排序
   */
  public async queryPaged<T>(
    Constructor: { new(): T },
    offset?: number,
    max?: number,
    where?: FindConditions<T> | ObjectLiteral | string,
    order?: { [P in keyof T]?: "ASC" | "DESC" | 1 | -1 },
    cache?: boolean | number | {
      id: any;
      milliseconds: number;
    }
  ): Promise<T[] | number> {
    return await this.$manager.queryPaged(
      Constructor,
      offset,
      max,
      where,
      order,
      cache
    );
  }

  /**
   * 统计数量
   * @param Constructor
   * @param options
   */
  public async count<T>(
    Constructor: { new(): T },
    options?: FindManyOptions<T> | FindConditions<T>
  ): Promise<number> {
    return await this.$manager.count(Constructor, options);
  }

  /**
   * 根据规则删除数据
   *
   * @template T
   * @param {{ new(): T }} Constructor
   * @param {(string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<T>)} criteria
   * @param {RemoveOptions} [options]
   * @returns {(Promise<DeleteResult | number>)}
   * @memberof DataAccessLayerProvider
   */
  public async delete<T>(
    Constructor: { new(): T },
    criteria: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<T>
    ): Promise<DeleteResult | number> {
    return await this.$manager.delete(Constructor, criteria);
  }

  /**
   *
   * 删除全部数据
   *
   * @template T
   * @template K
   * @param {{ new(): T; }} Constructor
   * @param {K} PrimaryKey
   * @returns {(Promise<DeleteResult | number>)}
   * @memberof DataAccessLayerProvider
   */
  public async deleteAll<T, K extends keyof T>(
    Constructor: { new(): T; },
    PrimaryKey: K): Promise<DeleteResult | number> {
    return await this.$manager.deleteAll(Constructor, PrimaryKey);
  }
}
