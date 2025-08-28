import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBservice from "../../DB/DB.service.js";
import User from "../../model/user.model.js";
import { uploadFilesCloud } from "../../utils/multier/cloudinary.js";
import { MassageModel } from "../../model/Massage.model.js";
export const sendMassage = asyncHandler(async (req, res, next) => {
  const { receiverId } = req.params;
  const {content}= req.body;
  let attachments = [];
  const { files } = req;

  if(!req.files && !content){
    return next(new Error("massage content or files is required", { cause: 400 }));
  }
  if (
    !(await DBservice.findOne({
      model: User,
      filter: {
        _id: receiverId,
        isVerified: true,
        deletedAt: null,
      },
    }))
  ) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (req.files) {
    attachments = await uploadFilesCloud({files: req.files, path: `User/${receiverId}`});
  }
  const [massage] = await DBservice.create({
    model:MassageModel,
    data:[{
      content,
      attachments,
      receiverId,
      senderId: req.user?._id
    }]
  })
  

  return successResponse({
    res,
    data: { massage },
    message: "massage send successfully",
    statusCode: 201,
  });
});



export const getMassageById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const massage = await DBservice.findOneAndUpdate({
    model: MassageModel,
    filter: {
      _id: id,
      $or: [
        { senderId: req.user._id },
        { receiverId: req.user._id }
      ]
    },
    data: { isRead: true }
  });
  if(!massage){
    return next(new Error("massage not found", { cause: 404 }));
  }
  return successResponse({
    res,
    data: { massage },
    message: "massage fetched successfully",
    statusCode: 201,
  });
});



export const getAllMassages = asyncHandler(async (req, res, next) => {
    // تحديث جميع الرسائل التي استلمها المستخدم إلى مقروءة
    const updateResult = await DBservice.updateMany({
      model: MassageModel,
      filter: { 
        receiverId: req.user._id,
        isRead: false 
      },
      data: { isRead: true }
    });
    const massages = await DBservice.find({
      model: MassageModel,
      filter: {
        $or: [
          { senderId: req.user._id },
          { receiverId: req.user._id }
        ]
      },
      populate: [
        { path: "senderId", select: "firstName lastName fullName" },
        { path: "receiverId", select: "firstName lastName fullName" }
      ],
      sort: { createdAt: -1 }
    });
  
    return successResponse({
      res,
      data: { massages },
      message: "Messages fetched successfully",
      statusCode: 200,
    });
  });



  export const deleteMassage = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    const massage = await DBservice.findOne({
      model: MassageModel,
      filter: { _id: id  , $or: [ { senderId: userId } , { receiverId: userId } ]  },
    })
    if(!massage){
      return next(new Error("massage not found", { cause: 404 }));
    }
    await DBservice.deleteOne({
      model: MassageModel,
      filter: { _id: id , $or: [ { senderId: userId } , { receiverId: userId } ]  },
    })
    return successResponse({
      res,
      data: { massage },
      message: "massage deleted successfully",
      statusCode: 200,
    });
  });
  
