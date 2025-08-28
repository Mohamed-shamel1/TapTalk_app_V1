import mongoose from "mongoose";


export const genderEnum = {male : "male" , female: "female"};
export const providerEnum = {system: "system", google: "google"};
export const roleEnum = {user: "user", admin: "admin"};
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true , minlength: 3, maxlength: 20  , massage: 'Username must be between 3 and 20 characters' },
  lastName: { type: String, required: true , minlength: 3, maxlength: 20  , massage: 'Username must be between 3 and 20 characters' },
  email:    { type: String, required: true, unique: true , match: /.+\@.+\..+/ , massege: 'Please enter a valid email address' },
  password: { type: String, required: function(){
    return this.provider === providerEnum.system ? true : false; // Only required for system users
  } },
  phone:    { type: String , required: function(){
    return this.provider === providerEnum.system ? true : false;
  } , massage: 'Phone number is required for system users' },
  gender:   { type: String, enum: Object.values(genderEnum), default: genderEnum.male },
  isVerified: { type: Boolean, default: false } ,
  role: { type: String, enum: Object.values(roleEnum), default: roleEnum.user } ,
  googleProfile: { type: String },
  profilePicture: { public_id : {type:String} , secure_url : {type:String} },
  coverPicture: [ { public_id : {type:String} , secure_url : {type:String} } ],
  provider: {
  type: String,
  enum: Object.values(providerEnum),
  default: providerEnum.system,
  required: true
},
HashOtp:{ type: String  },
otpExpireAt: { type: Date },
// عدد مرات إرسال OTP
  otpSendCount: { type: Number, default: 0 },
  otpLastSentAt: { type: Date },

  // إعادة تصفير العداد
  otpCounterResetAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: String, default: roleEnum.user },
  restoreAt: { type: Date, default: null },
  restoreBy: { type: String, default: roleEnum.user },
  changeCredintialsTime: { type: Date, default: null },
}, { timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
 });

// userSchema.index({otpExpireAt:1}, {expireAfterSeconds: 0});

userSchema.virtual("fullName").get(function() {
  return `${this.firstName} ${this.lastName}`;
}).set(function(name) {
  const parts = name.split(" ");
  this.firstName = parts[0] || "";
  this.lastName = parts[1] || "";
});


userSchema.virtual('massages', {
  ref: 'Massage',
  localField: '_id',
  foreignField: 'receiverId'
});
userSchema.virtual('sentMassages', {
  ref: 'Massage',
  localField: '_id',
  foreignField: 'senderId'
});

const User = mongoose.model("User", userSchema);

export default User;