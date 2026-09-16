import { Controller, Post, Body, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(JwtService) private jwtService: JwtService,
    @Inject(PrismaService) private prisma: PrismaService,
  ) {}
  @Post('login')
  async login(@Body() body: { username: string }) {
    if (!body.username) throw new UnauthorizedException('Username is required');
    const employee_id = body.username;
    const role = employee_id.startsWith('HR-') ? 'HR' : 'EMPLOYEE';
    const display_name = body.username;
    
    // Upsert account in DB to ensure FK relations work
    await this.prisma.account.upsert({
      where: { employee_id },
      update: { role, display_name },
      create: { employee_id, role, display_name },
    });
    
    const payload = { employee_id, role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      employee_id, role, display_name
    };
  }
}