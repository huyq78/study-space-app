import { ObjectId } from 'mongodb';
import { BaseModel } from './base.model';
import { BLOCK_STATUS } from '../constants/user-website-blocker.constants';

export class UserWebsiteBlockerModel extends BaseModel {
  public userId: ObjectId;
  public name: string;
  public url: string;
  public status: BLOCK_STATUS;
}
