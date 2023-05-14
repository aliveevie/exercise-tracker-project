const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const models = require('./models/models')

const mongoDB = process.env.MONGO_URI
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conneted to MongoDB!')
  })
  .catch(error => {
    console.log(error)
  })

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {

  res.sendFile(__dirname + '/views/index.html')
});


// ...
let data
// POST route
app.post('/api/users', (req, res) => {
  const user = req.body.username
  data = new models.userData({ username: user })

  // Save the data to MongoDB
  data.save()
    .then((savedData) => {
      //console.log('Data saved:', savedData);
      res.json({ username: data.username, _id: data._id }); // Send the response once
    })
    .catch(error => {
      console.error('Error saving data:', error);
      res.sendStatus(500); // Send the response once
    });
  console.log(models.userData.find().exec())
});


app.get('/api/user', (req, res) => {
  models.userData.find().exec()
    .then((data) => {
      //console.log('Data retrieved:', data);
      res.json(data); // Send the response with the retrieved data
    })
    .catch((error) => {
      console.error('Error retrieving data:', error);
      res.sendStatus(500); // Send the response once
    });
});



app.post('/api/users/:_id/exercises', async (req, res) => {

  const id = req.params._id
  const description = req.body.description
  const duration = req.body.duration
  const date = req.body.date

  // Assuming you have an existing user with the known _id

  // Find the document by its _id
  models.userData.findById(id)
    .then(user => {
      if (user) {


        const newLog = { description: description, duration: duration, date: date };
        user.log.push(newLog)


        return user.save();
      } else {
        throw new Error('User not found');
      }
    })
    .then(updatedUser => {
      logs = updatedUser.log[updatedUser.log.length - 1]


      res.json({
        _id: id,
        username: updatedUser.username,
        date: logs.date.toDateString(),
        duration: logs.duration,
        description: logs.description
      });
    })
    .catch(err => {
      console.error(err);
    });


});


// GET /api/users/:_id/logs endpoint
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const query = models.userData.findById(_id);

  // Apply filters for date range


  query.exec()
    .then((user) => {
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Count the logs
      let logCount = user.log.length;


      // Limit the logs
      let logs = user.log;

      if (limit) {
        logs = logs.slice(0, parseInt(limit));
      }


      const response = {
        username: user.username,
        count: logCount,
        _id: user._id,
        log: logs.map((log) => ({
          ...log.toObject(),
          date: log.date ? new Date(log.date).toDateString() : new Date().toDateString()
        }))
      };

      res.json(response);
    })
    .catch((error) => {
      console.error('Error retrieving user:', error);
      res.status(500).json({ error: 'An error occurred' });
    });
});

app.get('/api/users', (req, res) => {
  models.userData.find().exec()
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});


// ...


app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}!`)
})



