import type { Role, User } from "@prisma/client";

export type RoleCode = "admin" | "director" | "project_manager" | "client_manager" | "finance" | "analyst";

export type AuthUser = Pick<User, "id" | "fullName" | "email" | "isActive"> & {
  role: Pick<Role, "code" | "name">;
};

export type JwtPayload = {
  sub: string;
  role: RoleCode;
};
