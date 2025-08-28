import mongoose , { Schema } from "mongoose";

const massageSchema = new Schema({
    content:{
        type: String,
        required: true,
        minLength: 1,
        maxLength: 1000,
        required :function(){
            return this.attachments?.length?false:true
        }
    },
    attachments:[{secure_url: String, public_id: String}],
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    
},
{
    timestamps:true,
}
);

export const MassageModel = mongoose.model("Massage", massageSchema)|| mongoose.model.Massage ;
