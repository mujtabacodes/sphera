
import bcrypt from 'bcryptjs';

export async function verifyPassword(
  password: string,
  hashedPassword: string,
) {
  const secret = process.env.PASSWORD_SECRET;
  const passwordWithSecret = password + secret;
  console.log("Debuge 1"+passwordWithSecret);
  return await bcrypt.compare(passwordWithSecret, hashedPassword);
}

export async function hashPassword(
  password: string,
) {
  const secret = process.env.PASSWORD_SECRET;
  const passwordWithSecret = password + secret;
  const hashedPassword = await bcrypt.hash(passwordWithSecret, 10);
  return hashedPassword;
}