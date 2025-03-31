import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { drive_v3, google } from 'googleapis';
import { join } from 'path';

@Injectable()
export class ConectorGoogleService 
{    
    private drive: drive_v3.Drive;
    private FOLDER_ID = process.env.FOLDER_IMAGE_ID ?? (()=>{throw new InternalServerErrorException('FOLDER_IMAGE_ID no proporcionado')})(); // Reemplázalo con el ID de tu carpeta en Drive
    private keyFile = join( __dirname, '..', 'apikey.json' );

    constructor() {
        const auth = new google.auth.GoogleAuth({
            keyFile: this.keyFile, // Clave JSON de la cuenta de servicio
            scopes: ['https://www.googleapis.com/auth/drive'],
        });

        this.drive = google.drive({ version: 'v3', auth });
    }

    getDrive() {
        return this.drive;
    }

    getFolderId() {
        return this.FOLDER_ID;
    }

    async createFolder(name: string, parentFolderId: string): Promise<string> {
        const drive = this.getDrive();

        const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`;
        const existingFolders = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
        });

        if (existingFolders.data.files !== undefined && existingFolders.data.files[0].id) {
            return existingFolders.data.files[0].id;
        }

        const response = await drive.files.create({
            requestBody: { // 🔹 Aquí va la metadata del folder
                name,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolderId],
            },
            fields: 'id',
        });

        if (!response.data.id) {
            throw new InternalServerErrorException('No se pudo crear la carpeta en Google Drive');
        }

        return response.data.id;
    }
}