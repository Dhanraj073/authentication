const mongoose = require('mongoose');

// Schema defines how chat messages will be stored in MongoDB
const tokenSchema =new mongoose.Schema({
 email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  accessToken :{
    type :String,
    required:true
  },
  refreshToken :{
    type :String,
    required :true
  },
  expire1:{
    type :String,
    required :true
  },

  expire2 :{
    type:String,
    required :true
  }
});

tokenSchema.pre('save', function (next) {
  const user = this;
  console.log("2222222241",this.isModified('accesToken'),this.isModified('refreshToken'),this.isNew);
  //if (this.isModified('accesToken') || this.isModified('refreshToken') || this.isNew) {
    return next();
  //}
});

module.exports = mongoose.model('TokenSchema', tokenSchema);