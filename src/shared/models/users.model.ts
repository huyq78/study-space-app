import { BaseModel } from './base.model';
import { ObjectId } from 'mongodb';

export enum ROLE {
  ADMIN = 'admin',
  USER = 'user',
}

export class UserModel extends BaseModel {
  public email: string;
  public firstName: string;
  public lastName: string;
  public phoneNumber: string;
  public avatar: string;
  public salt: string;
  public hash: string;
  public isActive: boolean;
  public role?: ROLE;
  public createdby: ObjectId
}