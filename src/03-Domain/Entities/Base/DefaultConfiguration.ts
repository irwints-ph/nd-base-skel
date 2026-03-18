// ===========================================
// 🧩 src/03-Domain/Entities/Base/DefaultConfiguration.ts
// ===========================================

export enum ConfigValueType {
  SINGLE = "S",
  RANGE = "R",
}

export enum ConfigDataType {
  STRING = "STRING",
  INT = "INT",
  FLOAT = "FLOAT",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
}

export class DefaultConfiguration {
  public valueKey: string;
  public valueType: ConfigValueType;
  public dataType: ConfigDataType;
  public valueLow?: string | null;
  public valueHigh?: string | null;
  public description?: string | null;
  public isActive?: boolean | null;
  public createdBy?: number | null;
  public createdAt: Date;

  constructor(
    valueKey: string,
    valueType: ConfigValueType,
    dataType: ConfigDataType,
    valueLow?: string | null,
    valueHigh?: string | null,
    description?: string | null,
    isActive?: boolean | null,
    createdBy?: number | null
  ) {
    this.valueKey = valueKey;
    this.valueType = valueType;
    this.dataType = dataType;
    this.valueLow = valueLow ?? null;
    this.valueHigh = valueHigh ?? null;
    this.description = description ?? null;
    this.isActive = isActive ?? null;
    this.createdBy = createdBy ?? null;
    this.createdAt = new Date();

    this.validate();
  }

  private validate(): void {
    if (this.valueType === ConfigValueType.SINGLE) {
      if (!this.valueLow) {
        throw new Error("Single value requires ValueLow");
      }
      if (this.valueHigh) {
        throw new Error("Single value cannot have ValueHigh");
      }
    }

    if (this.valueType === ConfigValueType.RANGE) {
      if (!this.valueLow || !this.valueHigh) {
        throw new Error("Range requires both ValueLow and ValueHigh");
      }
    }

    if ([ConfigDataType.INT, ConfigDataType.FLOAT].includes(this.dataType)) {
      if (this.valueLow) {
        if (isNaN(Number(this.valueLow))) {
          throw new Error("ValueLow must be numeric");
        }
      }
      if (this.valueHigh) {
        if (isNaN(Number(this.valueHigh))) {
          throw new Error("ValueHigh must be numeric");
        }
      }
    }

    if (
      this.valueType === ConfigValueType.RANGE &&
      [ConfigDataType.INT, ConfigDataType.FLOAT].includes(this.dataType)
    ) {
      if (Number(this.valueLow) > Number(this.valueHigh)) {
        throw new Error("ValueLow cannot be greater than ValueHigh");
      }
    }
  }
}
