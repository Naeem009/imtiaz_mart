import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { API_VERSION } from "@imtiaz-mart/shared";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Public } from "@/common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

@ApiTags("auth")
@Controller({ path: "auth", version: API_VERSION })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new customer account" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with email and password" })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout and invalidate refresh token" })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset email" })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password with token" })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current authenticated user" })
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }
}
