require('dotenv').config();
const mongoose = require('mongoose')
const Schema  = mongoose.Schema;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true,
useFindAndModify: true });

const UsersSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  exercises: [
    {
      description: String,
      duration: String,
      date: Date
    }
  ]
});

const Users = mongoose.model('Users', UsersSchema)

function addNewUser(username, done){
  Users.create({
    username: username 
  }, function(err, data){
    if(err) return done(err);
    done(null, data);
  })
}     

function getAllUsers(done){
  Users.find({},done);
}

function addExercise(userid, exercise, done){
  Users.findOneAndUpdate({_id: userid}, {
    $addToSet: { exercises: [exercise]}
  },{ new: true },function(err, data){
    // console.log(`db: ${err}  ${data}`)
    if(err) return done(err);
    done(null, data)
  })
}

function getExerciseLogs(userid, from, to, limit, done){
  Users.findOne({
    _id: userid
  })
  .exec(function(err, data){
    if(err) return done(err);
    console.log(`data: ${data}`)
    //filter unwanted data
    let exercises = data["exercises"]
    if(exercises == undefined){
      exercises = []
    }
    exercises.filter(exercise=>{
      if(from!=undefined && from > exercise.date){
        return false;
      }
      if(to!=undefined && to < exercise.date){
        return false;
      }
      return true;
    })
    exercises = exercises.slice(0,limit);
    let resp = {
      _id: data["_id"],
      username: data["username"],
      log: exercises,
      count: exercises.length
    }
    console.log(`final data: ${JSON.stringify(resp)}`)

    done(null, resp);
  });
}

exports.addNewUser = addNewUser;
exports.addExercise = addExercise;
exports.getExerciseLogs = getExerciseLogs;  
exports.getAllUsers = getAllUsers;