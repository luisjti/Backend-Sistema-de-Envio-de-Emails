import { FilesInterceptor, FileFieldsInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { Injectable, NestInterceptor, UploadedFile, UseInterceptors, Type } from '@nestjs/common';
import { MulterField, MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
 
interface LocalFilesInterceptorOptions {
  fieldName?: MulterField[];
  fileName?: string;
  path?: string;
  fileFilter?: MulterOptions['fileFilter'];
  limits?: MulterOptions['limits'];
}

function LocalFilesInterceptor(options: LocalFilesInterceptorOptions){
    
    const multerOptions : MulterOptions = {
        storage: diskStorage({
            //destination: options.path,
            //filename : function (req: any, res:any, cb:any){
                //cb(null, options.fileName + Date.now());
            //}
        }),
        fileFilter: options.fileFilter,
        limits: options.limits
    }
    const filesInterceptor =  new (AnyFilesInterceptor(multerOptions))
    //const filesInterceptor =  new (FileFieldsInterceptor(options.fieldName, multerOptions))
    
return filesInterceptor
}
export default LocalFilesInterceptor;