import express from "express";
const registerUser = async (req: express.Request, res: express.Response) => {
  // Registration logic
  res.json({ message: "User registered successfully!" });
};

export default registerUser;
