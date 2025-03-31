import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prop, Guia, Reserva, Usuario } from '@turismo/modelos';
import { AppService } from 'src/app.service';
import { ConectorService } from 'src/services/conector.service';
import { ERROR } from 'src/utils/constants';
import { AuthorizationSessionData } from 'src/utils/interfaces';
import { SqlBuilder } from 'src/utils/SQLBuilder';

@Injectable()
export class ReservaService {

    query = `
        select json_object(
            'id': reserva.id,
            'fecha': reserva.fecha,
            'precio': reserva.precio,
            'destino': json_query((
                select
                    destino.id as id,
                    destino.nombre as nombre,
                    destino.descripcion as descripcion,
                    destino.imagen as imagen,
                    json_query((
                        select
                            ciudad.id as id,
                            ciudad.nombre as nombre,
                            json_query((
                                select
                                    pais.id as id,
                                    pais.nombre as nombre
                                from pais
                                where pais.id = ciudad.pais_id
                                for json path, without_array_wrapper
                            )) as pais
                        from ciudad
                        where ciudad.id = destino.ciudad_id
                        for json path, without_array_wrapper
                    )) as ciudad,
                    json_query((
                        select
                            destino_calificacion.id as id,
                            destino_calificacion.fecha as fecha,
                            destino_calificacion.comentario as comentario,
                            destino_calificacion.calificacion as calificacion,
                            json_query((
                                select
                                    usuario.id as id,
                                    usuario.usuario as usuario,
                                    usuario.nombre as nombre
                                from usuario
                                where usuario.id = destino_calificacion.usuario_id
                                for json path, without_array_wrapper
                            )) as usuario
                        from destino_calificacion
                        left join reserva r on r.id = destino_calificacion.reserva_id
                        where r.destino_id = destino.id
                        for json path
                    )) as calificaciones
                from destino
                where destino.id = reserva.destino_id
                for json path, without_array_wrapper
            )),
            'usuarios': json_query((
                select
                    usuario.id as id,
                    usuario.usuario as usuario,
                    usuario.nombre as nombre
                from reserva_usuario
                left join usuario on usuario.id = reserva_usuario.usuario_id
                where reserva_usuario.reserva_id = reserva.id
                for json path
            )),
            'guias': json_query((
                select
                    guia.id as id,
                    guia.nombre as nombre,
                    guia.descripcion as descripcion,
                    guia.anios_experiencia as aniosExperiencia,
                    guia.imagen as imagen,
                    json_query((
                        select
                            genero.id as id,
                            genero.nombre as nombre
                        from genero
                        where genero.id = guia.genero_id
                        for json path, without_array_wrapper
                    )) as genero,
                    json_query((
                        select
                            idioma.id as id,
                            idioma.nombre as nombre
                        from guia_idioma
                        left join idioma on idioma.id = guia_idioma.idioma_id
                        where guia_idioma.guia_id = guia.id
                        for json path
                    )) as idiomas
                from reserva_guia
                left join guia on guia.id = reserva_guia.guia_id
                where reserva_guia.reserva_id = reserva.id
                for json path
            ))
        ) as reserva
        from reserva
    `;


    constructor(
        private appService: AppService,
        private conectorService: ConectorService,
    )
    {
        this.appService.register({
            reserva: {
                getCollection: s => this.getCollection( s ),
                getItem: s => this.getItem( s, new Reserva( s.json.reserva ) ),
                getCollectionByGuia: s => this.getCollectionByGuia( s, new Guia( s.json.guia ) ),
                getCollectionBySearch: s => this.getCollectionBySearch( s, Prop.setString( s.json.value ) ?? '' ),
                getCollectionByUsuario: s => this.getCollectionByUsuario( s, new Usuario( s.json.usuario ) ),
                addUser: s => this.addUser( s, new Reserva( s.json.reserva ) )
            }
        });
    }


    async getId( s: AuthorizationSessionData )
    {
        return await this.conectorService.getId( s.transaction, 'reserva' );
    }


    async getCollection( s: AuthorizationSessionData )
    {
        return await this.conectorService.executeQuery({
            target: Reserva,
            transaction: s.transaction,
            query: this.query
        });
    }


    async getCollectionByGuia( s: AuthorizationSessionData, guia: Guia )
    {
        return await this.conectorService.executeQuery({
            target: Reserva,
            transaction: s.transaction,
            query: `
                ${this.query}
                left join reserva_guia on reserva_guia.reserva_id = reserva.id
                where reserva_guia.guia_id ${guia.id === undefined ? ' is null ' : ' = :guiaId '}
            `,
            parameters: {
                guiaId: guia.id ?? null
            }
        });
    }


    async getCollectionByUsuario( s: AuthorizationSessionData, usuario: Usuario )
    {
        return await this.conectorService.executeQuery({
            target: Reserva,
            transaction: s.transaction,
            query: `
                ${this.query}
                left join reserva_usuario on reserva_usuario.reserva_id = reserva.id
                where reserva_usuario.usuario_id ${usuario.id === undefined ? ' is null ' : ' = :usuarioId '}
            `, 
            parameters: {
                usuarioId: usuario.id ?? null
            }
        });
    }


    async getCollectionBySearch( s: AuthorizationSessionData, text2search: string )
    {
        return await this.conectorService.executeQuery({
            target: Reserva,
            transaction: s.transaction,
            query: `
                ${this.query}
                left join destino on destino.id = reserva.destino_id
                left join ciudad on ciudad.id = destino.ciudad_id
                left join pais on pais.id = ciudad.pais_id
                where destino.nombre like :text2search
                or ciudad.nombre like :text2search
                or pais.nombre like :text2search
            `, 
            parameters: {
                text2search: `%${text2search}%`
            }
        });
    }


    async getItem( s: AuthorizationSessionData, reserva: Reserva )
    {
        const data = await this.conectorService.executeQuery({
            target: Reserva,
            transaction: s.transaction,
            query: `
                ${this.query}
                where reserva.id ${reserva.id === undefined ? ' is null ' : ' = :id '}
            `,
            parameters: {
                id: reserva.id ?? null
            }
        });

        if ( data.length === 0 ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return data[0];
    }


    async addUser( s: AuthorizationSessionData, reserva: Reserva )
    {
        if ( reserva.id === undefined ) throw new InternalServerErrorException( 'Reserva sin identificador' );

        const usersRegistered: Array<{ cantidad: number }|undefined> = await this.conectorService.executeQuery({
            transaction: s.transaction,
            query: `
                select
                    count( reserva_usuario.id ) as cantidad
                from reserva_usuario
                where reserva_usuario.reserva_id = :reservaId
                and reserva_usuario.usuario_id = :usuarioId
            `,
            parameters: {
                reservaId: reserva.id,
                usuarioId: s.usuario.id
            }
        });

        if ( usersRegistered[0]?.cantidad !== undefined && usersRegistered[0]?.cantidad > 0 ) throw new InternalServerErrorException( 'Ya estas registrado en ésta reserva' );
        

        const id = await this.conectorService.getId( s.transaction, 'reserva_usuario' );
        const rows = await this.conectorService.executeNonQuery({
            transaction: s.transaction,
            ...SqlBuilder.insert( 'reserva_usuario' )
            .values([{
                id: id,
                reserva_id: reserva.id ?? null,
                usuario_id: reserva.usuarios[0].id ?? null
            }])
        });

        if ( rows === 0 ) throw new InternalServerErrorException( ERROR.NON_CREATE );

        return await this.getItem( s, reserva );
    }
}