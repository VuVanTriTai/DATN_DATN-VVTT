
export type Role = "student" | "mentor";

export interface User {
  _id: string;
  email: string;
  role: Role;
fullName: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}