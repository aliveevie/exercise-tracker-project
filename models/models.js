const { default: mongoose } = require('mongoose');



const Schema = new mongoose.Schema({
    username: String,
    log:[{
        description: String,
        duration: Number,
        date: Date
    }]
    
});




const userData = mongoose.model('userData', Schema)

const allUsers = userData.find()
module.exports = {
    userData,
    allUsers
}

// Danger Zone
/*
async function deleteAllDocuments() {
    try {
      await User.deleteMany({});
      console.log('All documents deleted successfully');
    } catch (err) {
      console.error(err);
    }
  }
  
  deleteAllDocuments();
*/
  

