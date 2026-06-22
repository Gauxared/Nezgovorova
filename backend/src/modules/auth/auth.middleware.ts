import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env.js";
import { ApiError } from "../../common/api-error.js";
import { getCurrentUser } from "./auth.service.js";
import type { AuthUser, JwtPayload, RoleCode } from "./types.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function getBearerToken(request: Request) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length);
}

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      throw new ApiError(401, "UNAUTHORIZED", "Требуется вход в систему");
    }

    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    request.user = await getCurrentUser(payload.sub);
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    next(new ApiError(401, "UNAUTHORIZED", "Недействительный или истекший токен"));
  }
}

export function requireRoles(roles: RoleCode[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      next(new ApiError(401, "UNAUTHORIZED", "Требуется вход в систему"));
      return;
    }

    if (!roles.includes(request.user.role.code as RoleCode)) {
      next(new ApiError(403, "FORBIDDEN", "Недостаточно прав для выполнения действия"));
      return;
    }

    next();
  };
}
