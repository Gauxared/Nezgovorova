import { Router } from "express";
import { ApiError } from "../../common/api-error.js";
import { login } from "./auth.service.js";
import { requireAuth, requireRoles } from "./auth.middleware.js";

export const authRouter = Router();

authRouter.post("/login", async (request, response, next) => {
  try {
    const { email, password } = request.body as { email?: unknown; password?: unknown };

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      throw new ApiError(400, "VALIDATION_ERROR", "Укажите email и пароль");
    }

    response.json(await login(email, password));
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, (request, response) => {
  response.json({ user: request.user });
});

authRouter.get("/admin-check", requireAuth, requireRoles(["admin"]), (request, response) => {
  response.json({ ok: true, user: request.user });
});
