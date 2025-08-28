
import multer from "multer";


export const fileValidation ={
  image: ["image/jpeg" , "image/png" , "image/jpg"],
  document :["application/pdf" , "application/msword" , "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
}
export const cloudFail = ({ validation =[] } = {}) => {

  const storage = multer.diskStorage({});
  const fileFilter = function (req , file , callback ) {
    if(validation.includes(file.mimetype)){ 
      return callback(null , true)
    }
    return callback(new Error("Invalid file type"), false)
  }

  return multer({
    storage,
    fileFilter,
  });
};
