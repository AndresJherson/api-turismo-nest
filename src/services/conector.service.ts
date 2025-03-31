import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Usuario } from '@turismo/modelos';
import { QueryTypes, Sequelize, Transaction } from 'sequelize';

@Injectable()
export class ConectorService {

    private dbhost = process.env.DB_HOST ?? '';
    private dbname = process.env.DB_NAME ?? '';
    private dbuser = process.env.DB_USER ?? '';
    private dbpassword = process.env.DB_PASSWORD ?? '';

    private sequelize: Sequelize;

    constructor()
    {
        this.sequelize = new Sequelize(
            this.dbname,
            this.dbuser,
            this.dbpassword,
            {
                host: this.dbhost,
                dialect: 'mssql',
            }
        );

        // this.prueba();
    }


    async prueba()
    {
        const t = await this.beginTransaction();
        const data = await this.executeQuery({
            target: Usuario,
            transaction: t,
            query: `
            
                select
                    usuario.id,
                    usuario.nombre,
                    usuario.usuario,
                    usuario.contrasena
                from usuario
                for json auto
            `
        });
        t.rollback();

        
    }


    async beginTransaction()
    {
        return await this.sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        });;
    }


    async getId( transaction: Transaction, tableName: string )
    {
        const data: Array<{id:number} | undefined> = await this.executeQuery({
            query: `select max(id) as id from ${tableName}`,
            transaction: transaction
        })

        return data[0]?.id === undefined ? 1 : data[0].id + 1;
    }


    async executeQuery<T>( parameter: ParameterExecuteQuery<T>  ): Promise<T[]>
    {
        try {

            const data: any[] = await this.sequelize.query( parameter.query, {
                replacements: parameter.parameters,
                transaction: parameter.transaction,
                type: QueryTypes.SELECT,
            } );

            if ( parameter.target === undefined ) return data;

            const columnName = Object.keys( data[ 0 ] ?? {} )[ 0 ];
            let newData: T[] = [];

// console.log( data );
            if ( parameter.target?.prototype ) {
                for ( const item of data ) {
                    newData.push( new ( parameter.target as new(...args:any[])=>T )( JSON.parse( item[columnName] ) ) );
                }
            }
            else {
                const arrayJson = data.map( item => JSON.parse( item[columnName] ) );
                newData = ( parameter.target as (...args:any[])=>T[] )( arrayJson );
            }

            // console.log( newData );
            return newData;
            
        }
        catch ( error: any ) {
            console.log( error );
            throw new InternalServerErrorException( 'Error en la lectura de datos.' );
        }
    }


    async executeNonQuery( parameter: ParameterExecuteNonQuery ): Promise<number>
    {
        try {

            const [ results, metadata ]: [ any, any ] = await this.sequelize.query( parameter.query, {
                replacements: parameter.parameters,
                transaction: parameter.transaction
            } );

            return parameter.lastId 
                ? results 
                : ( metadata?.affectedRows ?? metadata );
        }
        catch ( error: any ) {
            console.log( error );
            throw new InternalServerErrorException( 'Error en la escritura de datos.' );
        }
    }
}


export interface ParameterExecuteQuery<T>
{
    target?: ( new ( ...args: any[] ) => T ) | ( ( ...args: any[] ) => T[] ),
    transaction: Transaction,
    query: string,
    parameters?: Record<string,any>,
}

export interface ParameterExecuteNonQuery
{
    transaction: Transaction,
    query: string,
    parameters?: Record<string,any>,
    lastId?: boolean
}