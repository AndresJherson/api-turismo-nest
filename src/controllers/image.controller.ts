import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from 'src/services/image.service';

@Controller('image')
export class ImageController {

    constructor(
        private imageService: ImageService
    )
    {}


    @Post('uploadDestino')
    @UseInterceptors(FileInterceptor('image'))
    async uploadDestino(@UploadedFile() file: Express.Multer.File) 
    {
        if (!file) throw new InternalServerErrorException('No se ha subido ningún archivo');
        return await this.imageService.saveImageDestino(file);
    }


    @Post('uploadGuia')
    @UseInterceptors(FileInterceptor('image'))
    async uploadGuia(@UploadedFile() file: Express.Multer.File) 
    {
        if (!file) throw new InternalServerErrorException('No se ha subido ningún archivo');
        return await this.imageService.saveImageGuia(file);
    }


    @Delete(':id')
    async deleteImage(@Param('id') id: string) 
    {
        return await this.imageService.deleteImage(id);
    }
}