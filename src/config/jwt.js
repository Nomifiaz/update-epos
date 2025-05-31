import jwt from 'jsonwebtoken';
import config from "./config.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, userName: user.userName, roleId: user.roleId },
    config.jwtSecret,
    {
      expiresIn: config.accessTokenExpiresIn,
    },
  );
};
