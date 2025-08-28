// الملف ده بعمله عشان ابدل الميقودث بتاعه الداتا بيز اللى انا شغال فيها 
// عشان لو ف المستقبل قررت ابدل الداتا بيز بتاعتى من ميمورى ل داتا بيز تانيه
// اعدل ف الملف ده بس
import mongoose from "mongoose";

export const findOne = async ({model , filter = {} , select = "" }={}) => {
    return await model.findOne(filter).select(select);
}



export const create = async ({model 
    , data = [{}] 
    , options = {validateBeforeSave: true}
 }={}) => {
    return await model.create(data, options);
}

export const findById = async ({model , id , select = "" , populate = []}={}) => {
    let query =  await model.findById(id).select(select);
    if(populate.length > 0){
        query = await query.populate(populate);
    }
    return query;
}


export const findOneAndUpdate = async ({model , filter = {} , data = {} , options={runValidators: true , new: true} }={}) => {
    return await model.findOneAndUpdate(filter, data, {
        ...data,
        $inc:{__v: 1},
    });
}


export const deleteOne = async ({model , filter = {} }={}) => {
    return await model.deleteOne(filter);
}


export const find = async ({model , filter = {} , select = "" , populate = []}={}) => {
    let query =  model.find(filter).select(select);
    if(populate.length > 0){
        query =  query.populate(populate);
    }
    return await query;
}


export const updateMany = async ({model , filter = {} , data = {} }={}) => {
    return await model.updateMany(filter, data, { runValidators: true });
}