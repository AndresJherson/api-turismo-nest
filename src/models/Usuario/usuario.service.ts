import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Usuario } from '@turismo/modelos';
import { Transaction } from 'sequelize';
import { ConectorService } from 'src/services/conector.service';
import { ERROR } from 'src/utils/constants';
import { SqlBuilder } from 'src/utils/SQLBuilder';

@Injectable()
export class UsuarioService {

    query = `
        select json_object(
            'id': usuario.id,
            'nombre': usuario.nombre,
            'usuario': usuario.usuario,
            'contrasena': usuario.contrasena
        ) as usuario
        from usuario
    `;

    constructor(
        private conectorService: ConectorService,
    )
    {}


    async getId( t: Transaction)
    {
        return await this.conectorService.getId( t, 'usuario' );
    }


    async login( t: Transaction, usuario: Usuario )
    {
        const data = await this.conectorService.executeQuery({
            target: Usuario,
            transaction: t,
            query: `
                ${this.query}
                where usuario.usuario ${usuario.usuario === undefined ? ' is null ' : ' = :usuario '}
                and usuario.contrasena ${usuario.contrasena === undefined ? ' is null ' : ' = :contrasena '}
            `,
            parameters: {
                usuario: usuario.usuario ?? null,
                contrasena: usuario.contrasena ?? null
            }
        });

        if ( data.length === 0 ) throw new InternalServerErrorException( 'Usuario y contrasena invalido' );

        return data[0];
    }


    async getItem( t: Transaction, usuario: Usuario )
    {
        const data = await this.conectorService.executeQuery({
            target: Usuario,
            transaction: t,
            query: `
                ${this.query}
                where usuario.id ${usuario.id === undefined ? ' is null ' : ' = :id '}
            `,
            parameters: {
                id: usuario.id ?? null
            }
        });

        if ( data.length === 0 ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return data[0];
    }


    async createItem( t: Transaction, usuario: Usuario )
    {
        usuario.set({
            id: await this.getId( t )
        });

        const rows = await this.conectorService.executeNonQuery({
            transaction: t,
            ...SqlBuilder.insert( 'usuario' )
            .values([{
                id: usuario.id ?? null,
                nombre: usuario.nombre ?? null,
                usuario: usuario.usuario ?? null,
                contrasena: usuario.contrasena ?? null
            }])
        });

        if ( rows === 0 ) throw new InternalServerErrorException( ERROR.NON_CREATE );

        return await this.getItem( t, usuario );
    }
}