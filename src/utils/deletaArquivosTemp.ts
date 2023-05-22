import * as fs from "fs";

function deleteTempFiles ( files : Express.Multer.File[] ) {

    if(files[0]){
        for(var j = 0; j < (<any>files).length; j++){
            fs.unlink(files[j]['path'],(err) => {
               if (err) throw err;}) 
        }
    }
} 
    export default deleteTempFiles


