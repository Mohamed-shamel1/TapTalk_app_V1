import cloudinary from 'cloudinary';
import path from "path";
import dotenv from "dotenv";
dotenv.config(path.join("./.env")); // Load environment variables from .env file

export const cloud = () => {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary.v2;
};

export const uploadFileCloud = async ({file = {} , path = "general"}={})=>{
  return await cloud().uploader.upload(file.path, {
    folder: `${process.env.APP_NAME}/${path}`,
  });
}

export const uploadFilesCloud = async ({files = [] , path = "general"}={})=>{
  let attachments = [];
  for (const file of files) {
    const {secure_url , public_id} =  await uploadFileCloud({file: file, path: path});
    attachments.push({ secure_url: secure_url, public_id: public_id });
  }
  return attachments
  };


  export const deleteFileCloud = async ({public_id = ""}={})=>{
    return await cloud().uploader.destroy(public_id);
  }

  export const deleteResourcesCloud = async ({public_ids = [] , options = {
    type : "upload",
    resource_type : "image"
  }}={})=>{
    return await cloud().api.delete_resources(public_ids,options);
  } 


  export const deleteFolderByPrefixCloud = async ({prefix = ""}={})=>{
    return await cloud().api.delete_resources_by_prefix(`${process.env.APP_NAME}/${prefix}`);
  }
