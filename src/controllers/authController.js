import bcrypt from 'bcryptjs';
import * as jwt from '../config/jwt.js';
import User from '../models/userModel.js';

export const register = async (req, res) => {
  const { userName, password, role } = req.body;
  try {
    if (!userName || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'provide userName and password' });
    }
    const findUser = await User.findOne({ where: { userName } });
    if (findUser) {
      return res
        .status(409)
        .json({ success: false, message: 'user alreaday exits' });
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ userName, password: hashPassword,role });
    res.status(201).json({
      success: true,
      message: 'user registered',
      user: {
        id: newUser.id,
        userName: newUser.userName,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'error registering',
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { userName, password } = req.body;
  try {
    if (!userName || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'provide userName and password' });
    }
    const findUser = await User.findOne({ where: { userName } });
    if (!findUser) {
      return res
        .status(404)
        .json({ success: false, message: 'invalid userName or password' });
    }
    const validPassword = await bcrypt.compare(password, findUser.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: 'invalid userName or password' });
    }
    const accessToken = jwt.generateAccessToken(findUser);
    res.status(200).json({
      success: true,
      message: 'Logged in',
      accessToken,
      user: {
        id: findUser.id,
        userName: findUser.userName,
        role: findUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'error logging in',
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'provied both current and new Password',
      });
    }
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'user not logged in' });
    }
    const validPassword = bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401);
    }
    const hashPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'password updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'error resetting password',
      error: error.message,
    });
  }
};
