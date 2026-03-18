// src/Infrastructure/Persistence/Models/Constants/ContactTypes.ts

export class ContactTypes {
  static readonly Email = 1;
  static readonly Mobile = 2;
  static readonly WhatsApp = 3;
  static readonly Telegram = 4;

  static isValid(typeId: number): boolean {
    return [
      ContactTypes.Email,
      ContactTypes.Mobile,
      ContactTypes.WhatsApp,
      ContactTypes.Telegram,
    ].includes(typeId);
  }
}
