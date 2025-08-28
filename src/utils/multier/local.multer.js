import multer from "multer";
import fs from "node:fs";
import path, { resolve } from "node:path";


export const fileValidation ={
  image: ["image/jpeg" , "image/png" , "image/jpg"],
  document :["application/pdf" , "application/msword" , "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
}
export const localFail = ({ customPath = "general" , validation =[] } = {}) => {
  let basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination:function (req, file, callback){
      if (req.user?._id) {
        basePath += `/${req.user._id}`;
      }
      const fullPath = resolve(`./src/${basePath}`);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      callback(null, resolve(fullPath));
    },
    filename: function (req, file, callback){
      const uniquePhotoName =
        Date.now() + "__" + Math.random() + "__" + file.originalname;
      file.finalPath = basePath + "/" + uniquePhotoName;

      callback(null, uniquePhotoName);
    },
  });


  const fileFilter = function (req , file , callback ) {
    if(validation.includes(file.mimetype)){ 
      return callback(null , true)
    }
    return callback(new Error("Invalid file type"), false)
  }

  return multer({
    dest: "./temp",
    fileFilter,
    storage: storage
  });
};
