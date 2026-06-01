import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../common/database/database.service';
import { hashPassword, verifyPassword } from '../../common/utilities/hash.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.database.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const slug = dto.organizationName.toLowerCase().replace(/\s+/g, '-') + '-' + uuidv4().slice(0, 6);

    const [organization, passwordHash] = await Promise.all([
      this.database.organization.create({ data: { name: dto.organizationName, slug } }),
      hashPassword(dto.password),
    ]);

    const user = await this.database.user.create({
      data: {
        organizationId: organization.id,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: 'ORG_ADMIN',
      },
    });

    this.logger.log(`New organization registered: ${organization.name}`);
    return this.generateTokenPair(user.id, user.email, user.role, user.organizationId);
  }

  async login(dto: LoginDto) {
    const user = await this.database.user.findUnique({
      where: { email: dto.email, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.database.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokenPair(user.id, user.email, user.role, user.organizationId);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const stored = await this.database.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.userId !== userId || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.database.user.findUnique({ where: { id: userId } });
    await this.database.refreshToken.delete({ where: { id: stored.id } });

    return this.generateTokenPair(user.id, user.email, user.role, user.organizationId);
  }

  async logout(userId: string, refreshToken: string) {
    await this.database.refreshToken.deleteMany({
      where: { userId, token: refreshToken },
    });
    return { message: 'Logged out successfully' };
  }

  private async generateTokenPair(
    userId: string,
    email: string,
    role: string,
    organizationId: string,
  ) {
    const payload = { sub: userId, email, role, organizationId };

    const [accessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.accessSecret'),
        expiresIn: this.configService.get('jwt.accessExpiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.database.refreshToken.create({
      data: { userId, token: newRefreshToken, expiresAt },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
