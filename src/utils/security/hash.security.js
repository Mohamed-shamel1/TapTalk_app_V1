import bcrypt from 'bcrypt'; // Use bcryptjs for compatibility with older Node.js versions

export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hashSync(password, saltRounds);
}

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compareSync(password, hashedPassword);
}
