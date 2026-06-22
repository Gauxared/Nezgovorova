import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { ApiError } from "../../common/api-error.js";
import { prisma } from "../../prisma/client.js";
import { writeAuditLog } from "../../common/audit.js";
import type { AuthUser, JwtPayload, RoleCode } from "./types.js";

const TOKEN_EXPIRES_IN = "8h";

function toAuthUser(user: AuthUser) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    isActive: user.isActive,
    role: user.role
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      fullName: true,
      email: true,
      passwordHash: true,
      isActive: true,
      role: {
        select: {
          code: true,
          name: true
        }
      }
    }
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Неверный email или пароль");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Неверный email или пароль");
  }

  const payload: JwtPayload = {
    sub: user.id,
    role: user.role.code as RoleCode
  };

  const accessToken = jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_EXPIRES_IN });
  const { passwordHash: _passwordHash, ...authUser } = user;
  await writeAuditLog({ user: authUser, action: "login", entityType: "User", entityId: user.id });

  return {
    accessToken,
    user: toAuthUser(authUser)
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      isActive: true,
      role: {
        select: {
          code: true,
          name: true
        }
      }
    }
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, "UNAUTHORIZED", "Пользователь не найден или отключен");
  }

  return toAuthUser(user);
}
