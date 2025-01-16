import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) {}

    generateToken(payload: any, expiresIn: string = '24h'): string {
        return this.jwtService.sign(payload, { expiresIn });
    }

    verifyToken(token: string): any {
        return this.jwtService.verify(token);
    }
}
