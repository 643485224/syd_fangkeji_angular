import {
  Repository,
  ObjectLiteral,
} from "typeorm";
import { EntityType } from './entityType';

export class RepositoryItem<Entity extends ObjectLiteral & EntityType> {
  private $target: Function = null;
  private $tableName: string = "";
  private $repository: Repository<Entity> = null;

  constructor(Constructor: { new(): Entity }) {
    if (!("$tableName" in Constructor)) {
      throw Error(`class '${Constructor.name}' not impl '$tableName' field!`);
    }

    this.$target = Constructor;
    this.$tableName = (<any>Constructor).$tableName;
  }

  public get target(): Function & Entity {
    return <any>this.$target;
  }

  public get tableName(): string {
    return this.$tableName;
  }

  public get repository(): Repository<Entity> {
    return <any>this.$repository;
  }

  public set repository(value: Repository<Entity>) {
    this.$repository = value;
  }

  public isType<T>(Constructor: { new(): T } | Function): boolean {
    if (this.$target === Constructor) return true;
    return false;
  }
}
