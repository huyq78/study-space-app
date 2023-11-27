export type AuthTokenInfo = { 
  userId: string;
  status: boolean;
  expired_at?: Date;
  is_new? : boolean;
}

export interface DecodeInfo {
  exp: number;
  iat: number;
  is_new?: boolean;
}