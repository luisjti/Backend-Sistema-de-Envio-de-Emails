import { MulterField, MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { reduce } from 'rxjs';

function CheckTotalSize ( files : Express.Multer.File[] ) {

var totalSize: number = 0

    for(var j = 0; j < (<any>files).length; j++) {
        let size = files[j]['size']
        totalSize += size
    }
    return totalSize
}

export default CheckTotalSize