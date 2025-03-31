import { Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Post, UseInterceptors } from '@nestjs/common';
import { Usuario } from '@turismo/modelos';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { AuthenticationInterceptor } from 'src/interceptors/authentication.interceptor';
import { AuthService } from 'src/services/auth.service';
import { AuthenticationSessionData } from 'src/utils/interfaces';

@UseInterceptors(AuthenticationInterceptor)
@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService
    ) { }


    @Post('register')
    async register(@SessionDecorator() sessionData: AuthenticationSessionData) 
    {
        if ( !sessionData.json.usuario ) throw new InternalServerErrorException( 'Datos de Usuario no proporcionados' );
        const usuario = new Usuario( sessionData.json.usuario );

        return await this.authService.register(sessionData, usuario);
    }


    @Post('login')
    async login(@SessionDecorator() sessionData: AuthenticationSessionData )
    {
        if ( !sessionData.json.usuario ) throw new InternalServerErrorException( 'Datos de Usuario no proporcionados' );
        const usuario = new Usuario( sessionData.json.usuario );

        return await this.authService.login(sessionData, usuario);
    }


    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(@SessionDecorator() sessionData: AuthenticationSessionData) 
    {
        await this.authService.logout(sessionData.res);
    }


    @Get('verify')
    verify(@SessionDecorator() sessionData: AuthenticationSessionData) 
    {
        return this.authService.verifyToken(sessionData.req);
    }
}