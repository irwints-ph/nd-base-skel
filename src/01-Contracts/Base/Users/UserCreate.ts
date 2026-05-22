export interface UserCreateInput {
  username?: string;
  password?: string;
  active?: boolean;
  email?: string;
  firstname?: string;
  lastname?: string;
  begDate?: Date;
  endDate?: Date;
  ssoId?: string;
  typeId?: number;
  createdBy?: number;
}

export interface UserCreateResult {
  success: boolean;
  user?: UserCreate;
  errors?: Record<string, string>;
}

export class UserCreate {
  username?: string;
  password?: string;
  active: boolean;
  email?: string;
  firstname?: string;
  lastname?: string;
  begDate?: Date;
  endDate?: Date;
  ssoId?: string;
  typeId?: number;
  createdBy?: number;

  constructor(input: UserCreateInput) {
    this.username = input.username;
    this.password = input.password;
    this.active = input.active ?? true;
    this.email = input.email;
    this.firstname = input.firstname;
    this.lastname = input.lastname;
    this.begDate = input.begDate;
    this.endDate = input.endDate;
    this.ssoId = input.ssoId;
    this.typeId = input.typeId;
    this.createdBy = input.createdBy;
  }

  /**
   * Static factory method to create a UserCreate instance with validation
   */
  static create(input: UserCreateInput): UserCreateResult {
    const errors: Record<string, string> = {};

    if (!input.username) errors.username = "Username is required.";
    if (!input.firstname) errors.firstname = "Firstname is required.";
    if (!input.lastname) errors.lastname = "Lastname is required.";
    if (!input.email) {
      errors.email = "Email is required.";
    } else if (!input.email.includes("#")) {
      errors.email = "Email is invalid.";
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    const user = new UserCreate(input);
    return { success: true, user };
  }
}
