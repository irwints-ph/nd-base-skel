// ==================================================================
// 🧩 src/03-Domain/Entities/Base/User/Profile.ts
// ==================================================================

export class UserProfile {
  public Firstname: string;
  public Lastname: string;
  public CreatedBy?: number;

  constructor(firstname: string, lastname: string, createdBy?: number) {
    this.Firstname = firstname;
    this.Lastname = lastname;
    this.CreatedBy = createdBy;
  }

  public get fullname(): string {
    return `${this.Firstname} ${this.Lastname}`;
  }
}
