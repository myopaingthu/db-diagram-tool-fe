import { Base } from "./base";
import type { ApiResponse, AuthResponse, RegisterDto, LoginDto, User } from "@/app/types";

export class Auth extends Base {
  register(dto: RegisterDto): Promise<ApiResponse<AuthResponse>> {
    return this.http.post("/api/core/auth/register", dto);
  }

  login(dto: LoginDto): Promise<ApiResponse<AuthResponse>> {
    return this.http.post("/api/core/auth/login", dto);
  }

  getMe(): Promise<ApiResponse<User>> {
    return this.http.get("/api/core/auth/me");
  }

  logout(): void {
    localStorage.removeItem("token");
  }
}

