import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsuarioService } from './models/Usuario/usuario.service';
import { ReservaService } from './models/Reserva/reserva.service';
import { GuiaService } from './models/Guia/guia.service';
import { TransactionInterceptor } from './interceptors/transaction.interceptor';
import { ConectorService } from './services/conector.service';
import { ImageController } from './controllers/image.controller';
import { ImageService } from './services/image.service';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { ConectorGoogleService } from './services/conector-google.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
            secret: 'secretKey',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [AppController, ImageController, AuthController],
    providers: [AppService, UsuarioService, ReservaService, GuiaService, TransactionInterceptor, ConectorService, ImageService, AuthService, ConectorGoogleService],
})
export class AppModule { }
