export type TokenMailer = {
  email: string;
  token: string;
  local_issuer: string;
  fullname: string;
  app_logo?: string;
  app_name?: string;
};
