import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";

import EmailService from "../../services/emailService";
import db from "../../models";
import UserController from "../../controllers/v1/user";

const userRouter = express.Router();
const apiRoute = `${process.env.PAGE_URL}api/v1`;
const cookie_key = "token";

const uContr: UserController = new UserController(
  db.User,
  new EmailService(apiRoute)
);

async function signOut(req: Request, res: Response) {
  res
    .clearCookie(cookie_key, {
      httpOnly: true,
    })
    .status(204)
    .json();
}

export async function signInHandler(req: Request, res: Response) {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      res.status(400).json({
        message:
          (!userName
            ? !password
              ? "Username and password"
              : "Username"
            : "Password") + " not provided",
      });
      return;
    }

    const response = await uContr.signIn(userName, password);
    const user = response.data.result;

    if (user) {
      const token = jwt.sign(
        { username: user.userName, id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      const getDateOffset = (hours: number) => {
        const today = new Date();
        today.setHours(today.getHours() + hours);
        return today;
      };

      res
        .cookie(cookie_key, JSON.stringify(token), {
          httpOnly: true,
          expires: getDateOffset(1),
        })
        .status(response.status)
        .json(response.data);
    } else {
      res.status(response.status).json(response.data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function signUpHandler(req: Request, res: Response) {
  const { email, userName, password, firstName, lastName } = req.body;

  if (!email || !userName || !password || !firstName || !lastName) {
    res.status(400).json({ message: "Missing values in request body" });
    return;
  }

  const response = await uContr.createUser(
    email,
    userName,
    password,
    firstName,
    lastName
  );

  res.status(response.status).json(response.data);
}

async function confirmEmailHandler(req: Request, res: Response) {
  const token = req.query.c as string;

  if (!token) {
    res.status(400).json({ code: 400, message: "Missing token." });
    return;
  }

  if (await uContr.confirmEmail(token)) {
    res.status(204).json();
  } else {
    res
      .status(400)
      .json({ code: 400, message: "Token is invalid or expired." });
  }
}

async function resetPassHandler(req: Request, res: Response) {
  if (!req.query.r || !req.body.password || !req.body.password_confirmation) {
    res.status(400).json({
      code: 400,
      message: "Missing token or password.",
    });
    return;
  }

  const status = await uContr.resetPassword(
    req.query.r as string,
    req.body.password,
    req.body.password_confirmation
  );

  if (status) {
    res.status(204).json();
  } else {
    res
      .status(400)
      .json({ code: 400, message: "Token is invalid or expired." });
  }
}

userRouter.post("/signin", signInHandler);
userRouter.post("/signup", signUpHandler);
userRouter.post("/signout", signOut);

userRouter.get("/confirm", confirmEmailHandler);
userRouter.get("/reset", resetPassHandler);

export default userRouter;
