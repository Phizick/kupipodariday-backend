import * as bcrypt from 'bcrypt';

export class HashProvider {
  static async generateHash(password: string): Promise<string> {
    return bcrypt.hash(password, 8);
  }
  static async validateHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
