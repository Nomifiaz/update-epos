const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT,
  mySqlUri: process.env.MYSQL_URI,
  mySqlOnline: process.env.MYSQL_ONLINE,
  jwtSecret: process.env.JWT_SECRET,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRE,
}
export default config
