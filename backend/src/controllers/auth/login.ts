import express from "express";

const loginUser = async (req: express.Request, res: express.Response) => {
  // Login logic
  res.json({ message: "User logged in successfully!" });
};

export default loginUser;
