import jwt from 'jsonwebtoken';
import config from "./config.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, userName: user.userName, role: user.role },
    config.jwtSecret,
    {
      expiresIn: config.accessTokenExpiresIn,
    },
  );
};
