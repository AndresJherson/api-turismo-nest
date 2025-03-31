import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConectorGoogleService } from './conector-google.service';
import { Readable } from 'stream';

@Injectable()
export class ImageService {

    private destinosFolderId: string;
    private guiasFolderId: string;

    constructor(private conectorGoogleService: ConectorGoogleService) {
        this.initializeFolders();
    }

    async initializeFolders() {
        const drive = this.conectorGoogleService.getDrive();
        const parentFolderId = this.conectorGoogleService.getFolderId();

        this.destinosFolderId = await this.conectorGoogleService.createFolder('Destinos', parentFolderId);
        this.guiasFolderId = await this.conectorGoogleService.createFolder('Guias', parentFolderId);
    }

    async uploadImage(file: Express.Multer.File, folderId: string): Promise<string> {
        const drive = this.conectorGoogleService.getDrive();

        const response = await drive.files.create({
            requestBody: {
                name: file.originalname,
                parents: [folderId],
            },
            media: {
                mimeType: file.mimetype,
                body: Readable.from(file.buffer),
            },
            fields: 'id, webViewLink, webContentLink',
        });

        const fileId = response.data.id;
        if (!fileId) {
            throw new InternalServerErrorException('No se pudo subir la imagen');
        }
    
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return `https://drive.google.com/thumbnail?id=${fileId}`;
    }

    async saveImageDestino(file: Express.Multer.File): Promise<string> {
        if (!this.destinosFolderId) await this.initializeFolders();
        return this.uploadImage(file, this.destinosFolderId);
    }

    async saveImageGuia(file: Express.Multer.File): Promise<string> {
        if (!this.guiasFolderId) await this.initializeFolders();
        return this.uploadImage(file, this.guiasFolderId);
    }

    async deleteImage(fileId: string): Promise<void> {
        const drive = this.conectorGoogleService.getDrive();
        const response = await drive.files.delete({ fileId });

        if (response.status !== 204) {
            throw new InternalServerErrorException('No se pudo eliminar la imagen de Google Drive');
        }
    }
}

