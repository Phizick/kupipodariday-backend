import * as bcrypt from 'bcrypt';

export class HashProvider {
  static async generateHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(8);
    return bcrypt.hash(password, salt);
  }

  static async validatePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    if (typeof password !== 'string' || typeof hash !== 'string') {
      return false;
    }

    return await bcrypt.compare(password, hash);
  }
}
