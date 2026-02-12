import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User, UserRole } from "../entities/User";

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(data: RegisterDto): Promise<{ user: User; token: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("このメールアドレスは既に登録されています");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    const token = this.generateToken(user);

    return { user, token };
  }

  async login(data: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("メールアドレスまたはパスワードが正しくありません");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("メールアドレスまたはパスワードが正しくありません");
    }

    if (!user.isActive) {
      throw new Error("アカウントが無効化されています");
    }

    const token = this.generateToken(user);

    return { user, token };
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  private generateToken(user: User): string {
    const secret = process.env.JWT_SECRET || "default-secret";

    return jwt.sign({ userId: user.id, role: user.role }, secret, {
      expiresIn: "7d",
    });
  }
}
