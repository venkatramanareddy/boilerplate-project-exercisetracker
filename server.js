const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
var bodyParser = require('body-parser')
var backend = require('./backend')

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const errorResp = { error: 'Invalid Request'}

app.get('/api/users', (req, res)=>{
  backend.getAllUsers(function(err, data){
    if(err) return res.send(err);
    res.send(data);
  })
})

app.post('/api/users', (req,res)=>{
  console.log(`req: ${JSON.stringify(req.body)}`)
  backend.addNewUser(req.body.username, function(err, data){
    if(err) return res.send(errorResp);
    res.send(data);
  })
})

app.post('/api/users/:_id/exercises', (req,res)=>{
  console.log(`req: ${JSON.stringify(req.body)}`)  
  let date = req.body.date?req.body.date: new Date();
  var exercise = {
    duration: req.body.duration,
    description: req.body.description,
    date: date
  }
  console.log(`exercise: ${exercise}`)
  backend.addExercise(req.params._id, exercise, function(err, data){
    if(err) return res.send(errorResp);

    let resp = {
      _id: data._id,
      username: data.username,
      date: new Date(exercise.date).toDateString(),
      duration: parseInt(exercise.duration),
      description: exercise.description
    }
    res.send(resp);
  })
})

app.get('/api/users/:_id/logs',(req, res)=>{
  console.log(`params: ${JSON.stringify(req.params)} ${JSON.stringify(req.query)}`)
  let from = (req.query.from);
  let to = (req.query.to);
  let limit = req.query.limit;
  backend.getExerciseLogs(req.params._id, from, to, limit, function(err, data){
    if(err) return res.send(err);
    res.send(data);
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
