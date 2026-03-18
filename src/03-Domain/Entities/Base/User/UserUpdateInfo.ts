// ==================================================================
// 🧩 src/03-Domain/Entities/Base/User/UserUpdateInfo.ts
// ==================================================================

import { Contact } from "./Contact.ts";

export class UserUpdateInfo {

  username?: string;
  password?: string;

  firstname?: string;
  lastname?: string;

  begDate?: Date;
  endDate?: Date;

  profile?: any;

  contacts?: Contact[];

  constructor({
    username,
    password,
    firstname,
    lastname,
    begDate,
    endDate,
    profile,
    contacts
  }: {
    username?: string
    password?: string
    firstname?: string
    lastname?: string
    begDate?: Date
    endDate?: Date
    profile?: any
    contacts?: Contact[]
  } = {}) {

    this.username = username
    this.password = password
    this.firstname = firstname
    this.lastname = lastname

    this.begDate = begDate
    this.endDate = endDate

    this.profile = profile
    this.contacts = contacts

  }

}