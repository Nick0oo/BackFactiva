// forgot-password.dto.ts
export class ForgotPasswordDto {
    email: string;
  }
  
  // reset-password.dto.ts
  export class ResetPasswordDto {
    token: string;
    newPassword: string;
  }
  