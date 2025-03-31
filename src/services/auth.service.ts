import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from '@turismo/modelos';
import { UsuarioService } from 'src/models/Usuario/usuario.service';
import { AuthenticationSessionData } from 'src/utils/interfaces';
import { Request, Response } from 'express';

@Injectable()
export class AuthService 
{
    secretKey = 'secretKey';

    constructor(
        private readonly jwtService: JwtService,
        private usuarioService: UsuarioService
    ) { }


    async register( s: AuthenticationSessionData, usuario: Usuario ): Promise<Usuario>
    {
        
        try {
            const item = await this.usuarioService.createItem(s.transaction, usuario);
            return this.handleAuthSuccess(s.res, item);
        } catch (error) {
            throw new InternalServerErrorException('Error al registrar usuario');
        }
    }


    async login( s: AuthenticationSessionData, usuario: Usuario ): Promise<Usuario>
    {
        try {
            const item = await this.usuarioService.login( s.transaction, usuario);
            return this.handleAuthSuccess( s.res, item);
        } catch (error) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }
    }


    async logout( res: Response )
    {
        res.clearCookie( 'token' );
    }


    verifyToken( req: Request ): Usuario
    {
        try {
   console.log('req.headers.cookie:', req.headers.cookie); // 🔥 Verifica si la cookie llega aquí
    console.log('req.cookies:', req.cookies)

            const token = req.cookies?.token;
            if (!token) throw new UnauthorizedException('Token no proporcionado');
            const payload = this.jwtService.verify(token);
            return new Usuario( payload );

        } catch (error) {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }


    private handleAuthSuccess( res: Response, usuario: Usuario): Usuario 
    {
        const { contrasena, ...payload } = usuario;
        const token = this.jwtService.sign(payload, { secret: this.secretKey });
        this.setAuthCookie(res, token);
        return new Usuario(payload);
    }


    private setAuthCookie( res: Response, token: string): void 
    {
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
    }
}