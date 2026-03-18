// src/Application/DTO/Base/CreateUserDTO.ts
export interface CreateUserDTO {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email?: string;
  isEmailValidated?: boolean;
  createdBy: number;
}
