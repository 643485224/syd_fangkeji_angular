import {
  Connection,
  Repository,
  DeepPartial,
  ObjectLiteral,
  RemoveOptions,
  SaveOptions,
  FindConditions,
  Not,
  DeleteResult,
  FindManyOptions,
  ObjectID
} from "typeorm";
import { EntityType } from './entityType';
import { RepositoryItem } from "./repositoryItem";

export class RepositoryManager<Entity extends ObjectLiteral & EntityType> {
  private $array: RepositoryItem<Entity>[];

  constructor() {
    this.$array = new Array<RepositoryItem<Entity>>();
  }

  public addEntity<T>(Constructor: { new(): T }): number {
    for (let i: number = 0; i < this.$array.length; i++) {
      if (this.$array[i].isType(Constructor)) return -1;
    }

    let item: RepositoryItem<T> = new RepositoryItem(Constructor);
    this.$array.push(<any>item);
  }

  public get entities(): Entity[] {
    let result: Entity[] = new Array<Entity>();

    this.$array.forEach((item: RepositoryItem<Entity>) => {
      result.push(item.target);
    });

    return result;
  }

  public get repositories(): Repository<Entity>[] {
    let result: Repository<Entity>[] = new Array<Repository<Entity>>();

    this.$array.forEach((item: RepositoryItem<Entity>) => {
      result.push(item.repository);
    });

    return result;
  }

  public initRepository(conn: Connection): number {
    let count: number = 0;

    this.$array.forEach((item: RepositoryItem<Entity>) => {
      item.repository = conn.getRepository<Entity>(item.tableName);
      count++;
    });

    return count;
  }

  public async save<T extends DeepPartial<Entity>>(
    Constructor: { new(): T },
    obj: T | T[],
    options?: SaveOptions
  ): Promise<T | number> {
    let repo: Repository<T>;

    repo = this.getRepository<T>(Constructor);

    if (!repo) return -1;

    return await repo.save<any>(obj, options);
  }

  public async remove<T extends DeepPartial<Entity>>(
    Constructor: { new(): T },
    obj: T,
    options?: RemoveOptions
  ): Promise<T | number> {
    let repo: Repository<T>;

    repo = this.getRepository<T>(Constructor);

    if (!repo) return -1;

    return await repo.remove(obj, options);
  }

  public async removes<T extends DeepPartial<Entity>>(
    Constructor: { new(): T },
    obj: T[],
    options?: RemoveOptions
  ): Promise<T[] | number> {
    let repo: Repository<T>;

    repo = this.getRepository<T>(Constructor);

    if (!repo) return -1;

    return await repo.remove(obj, options);
  }

  public async query<T extends DeepPartial<Entity>>(
    Constructor: { new(): T },
    where?: FindConditions<Entity> | ObjectLiteral | string,
    order?: { [P in keyof T]?: "ASC" | "DESC" | 1 | -1 },
    cache?: boolean | number | {
      id: any;
      milliseconds: number;
    }): Promise<T[] | number> {
    let repo: Repository<T>;

    repo = this.getRepository<T>(Constructor);

    if (!repo) return -1;

    return repo.find({
      where: where,
      order: order,
      cache: cache
    });
  }

  public async queryOne<T extends DeepPartial<Entity>>(
    Constructor: { new(): T },
    where?: FindConditions<Entity> | ObjectLiteral | string,
    order?: { [P in keyof T]?: "ASC" | "DESC" | 1 | -1 },
    cache?: boolean | number | {
      id: any;
      milliseconds: number;
    }
  ): Promise<T | number> {
    let repo: Repository<T>;

    repo = this.getRepository<T>(Constructor);

    if (!repo) return -1;

    return await repo.findOne({
      where: where,
      order: order,
      cache: cache
    });
  }

  /**
   * 分页查询数据
   * @param offset
   * @param max
   * @param where
   * @param order
   * sample:
   * queryPaged(
   *    offset,
   *    pagesize,
   *    { field1: value1 },
   *    { id: "DESC" }
   * );
   */
  public async queryPaged<T extends DeepPartial<Entity>>(
    Constructor: { new(): T },
    offset?: number,
    max?: number,
    where?: FindConditions<Entity> | ObjectLiteral | string,
    order?: { [P in keyof T]?: "ASC" | "DESC" | 1 | -1 },
    cache?: boolean | number | {
      id: any;
      milliseconds: number;
    }
  ): Promise<T[] | number> {
    let repo: Repository<T>;

    repo = this.getRepository<T>(Constructor);

    if (!repo) return -1;

    return await repo.find({
      skip: offset,
      take: max,
      where: where,
      order: order,
      cache: cache
    });
  }

  public async count<T extends DeepPartial<Entity>>(
    Constructor: { new(): T },
    options?: FindManyOptions<T> | FindConditions<T>
  ): Promise<number> {
    let repo: Repository<T>;

    repo = this.getRepository<T>(Constructor);

    if (!repo) return -1;

    return await repo.count(options);
  }

  public async delete<T extends DeepPartial<Entity>>(
    Constructor: { new(): T },
    criteria: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<T>
    ): Promise<DeleteResult | number> {
    let repo: Repository<T>;

    repo = this.getRepository<T>(Constructor);

    if (!repo) return -1;

    return await repo.delete(criteria);
  }


  public async deleteAll<T extends DeepPartial<Entity>, K extends keyof T>(
    Constructor: { new(): T; },
    PrimaryKey: K
  ): Promise<DeleteResult | number> {
    let repo: Repository<T>;
    let find: FindConditions<T> = <any>new Object();
    //let pk: string = "id";

    repo = this.getRepository<T>(Constructor);

    if (!repo) return -1;
    //if (!(pk in Constructor.prototype)) return -2;

    find[PrimaryKey] = <any>Not(0);

    return await repo.delete(find);
  }

  public getRepository<T>(Constructor: { new(): T }): Repository<T> | null {
    for (let i: number = 0; i < this.$array.length; i++) {
      if (this.$array[i].isType(Constructor))
        return <any>this.$array[i].repository;
    }

    return null;
  }
}
