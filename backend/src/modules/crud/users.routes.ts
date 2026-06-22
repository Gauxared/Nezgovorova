import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { prisma } from "../../prisma/client.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get("/", async (_request, response, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: { select: { code: true, name: true } }
      }
    });

    response.json({ data: users });
  } catch (error) {
    next(error);
  }
});
