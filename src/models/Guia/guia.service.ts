import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prop, Guia } from '@turismo/modelos';
import { AppService } from 'src/app.service';
import { ConectorService } from 'src/services/conector.service';
import { ERROR } from 'src/utils/constants';
import { AuthorizationSessionData } from 'src/utils/interfaces';

@Injectable()
export class GuiaService {

    query = `
        select json_object(
            'id': guia.id,
            'nombre': guia.nombre,
            'descripcion': guia.descripcion,
            'aniosExperiencia': guia.anios_experiencia,
            'imagen': guia.imagen,
            'genero': json_query((
                select
                    genero.id as id,
                    genero.nombre as nombre
                from genero
                where genero.id = guia.genero_id
                for json path, without_array_wrapper
            )),
            'idiomas': json_query((
                select
                    idioma.id as id,
                    idioma.nombre as nombre
                from guia_idioma
                left join idioma on idioma.id = guia_idioma.idioma_id
                where guia_idioma.guia_id = guia.id
                for json path
            )) ,
            'calificaciones': json_query((
                select
                    guia_calificacion.id as id,
                    guia_calificacion.fecha as fecha,
                    guia_calificacion.comentario as comentario,
                    guia_calificacion.calificacion as calificacion,
                    json_query((
                        select
                            usuario.id as id,
                            usuario.usuario as usuario,
                            usuario.nombre as nombre
                        from usuario
                        where usuario.id = guia_calificacion.usuario_id
                        for json path, without_array_wrapper
                    )) as usuario
                from guia_calificacion
                where guia_calificacion.guia_id = guia.id
                for json path
            ))
        ) as guia
        from guia
    `;

    constructor(
        private appService: AppService,
        private conectorService: ConectorService,
    )
    {
        this.appService.register({
            guia: {
                getCollection: s => this.getCollection( s ),
                getCollectionBySearch: s => this.getCollectionBySearch( s, Prop.setString( s.json.value ) ?? '' ),
                getItem: s => this.getItem( s, new Guia( s.json.guia ) )
            }
        });
    }


    async getId( s: AuthorizationSessionData )
    {
        return await this.conectorService.getId( s.transaction, 'guia' );
    }


    async getCollection( s: AuthorizationSessionData )
    {
        return await this.conectorService.executeQuery({
            target: Guia,
            transaction: s.transaction,
            query: this.query
        });
    }


    async getCollectionBySearch( s: AuthorizationSessionData, text2search: string )
    {
        return await this.conectorService.executeQuery({
            target: Guia,
            transaction: s.transaction,
            query: `
                ${this.query}
                where guia.nombre like :text2search
            `,
            parameters: {
                text2search: `%${text2search}%`
            }
        });
    }


    async getItem( s: AuthorizationSessionData, guia: Guia )
    {
        const data = await this.conectorService.executeQuery({
            target: Guia,
            transaction: s.transaction,
            query: `
                ${this.query}
                where guia.id ${guia.id === undefined ? ' is null ' : ' = :id '}
            `,
            parameters: {
                id: guia.id ?? null
            }
        });

        if ( data.length === 0 ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return data[0];
    }
}