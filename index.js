const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const bodyParser = require('body-parser')
const cors = require('cors')
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const dbURL = `mongodb+srv://Madhuri:sreedhar@123@mentortstudent.zhhty.mongodb.net/studentmentor?retryWrites=true&w=majority`;
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    if (req.method == 'OPTIONS') {
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,PATCH");
        return res.status(200).json({});
    }
    next();
})
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));

var morgan = require('morgan')
app.use(morgan(':method Request :url status code :status  res-time :response-time ms'));

let mentor = [];
let student = [];
let mentorId = 0;
let studentId = 0;

app.post('/mentor', (req, res) => {
    console.log(req.body);
    if (req.body.name == '' || req.body.name == undefined || req.body.phoneNo == '' || req.body.phoneNo == undefined)
        res.status(400).json({
            msg: "Name or Phoneno missing"
        })
    else {
        let obj = req.body;
        obj["students"] = [];
        mongoClient.connect(dbURL, (err, client) => {
                if (err) throw err;
                let db = client.db('mentorAssign');
                db.collection("mentor").insertOne(obj, (err, data) => {
                    if (err) throw err;
                    client.close();
                    res.status(200).json({
                        msg: "Successfully added mentor"
                    })
                })

            })
            // mentor.push({
            //     id: mentorId,
            //     name: req.body.name,
            //     age: req.body.age,
            //     role: req.body.role,
            //     phoneNo: req.body.phoneNo,
            //     students: []
            // })
            // mentorId++;

    }
})

app.post('/students', (req, res) => {
    if (req.body.name == '' || req.body.name == undefined || req.body.batchNo == '' || req.body.batchNo == undefined || req.body.phoneNo == '' || req.body.phoneNo == undefined)
        res.status(400).json({
            msg: "Name or Batch or Phone number missing."
        })
    else {
        let obj = req.body;
        obj["mentor"] = "";
        mongoClient.connect(dbURL, (err, client) => {
                if (err) throw err;
                let db = client.db('mentorAssign');
                db.collection("student").insertOne(req.body, (err, data) => {
                    if (err) throw err;
                    client.close();
                    res.status(200).json({
                        msg: "Successfully added student"
                    })
                })

            })
            // student.push({
            //     id: studentId,
            //     name: req.body.name,
            //     batchNo: req.body.batchNo,
            //     course: req.body.course,
            //     phoneNo: req.body.phoneNo,
            //     mentor: ""
            // })
            // studentId++;

    }
})


app.post('/assignstudent', (req, res) => {
    if (req.body.mentorId == undefined || req.body.students == undefined)
        res.status(400).json({
            msg: "Mentor or Students missing."
        })
    else {
        // let mentors = req.body.mentorId;
        let mentors = mongodb.ObjectID(req.body.mentorId);
        let studentIds = req.body.students;
        for (let i of studentIds) {
            i = mongodb.ObjectID(i);
            // student[i].mentor = JSON.parse(JSON.stringify(mentor[mentors]));
            // mentor[mentors].students.push(JSON.parse(JSON.stringify(student[i])))
            mongoClient.connect(dbURL, (err, client) => {
                if (err) throw err;
                let db = client.db('mentorAssign');
                db.collection("student").updateOne({ _id: i }, { $set: { mentor: mentors } }, (err, data) => {
                    if (err) throw err;
                    db.collection("mentor").updateOne({ _id: mentors }, { $push: { students: i } }, (err, data) => {
                        if (err) throw err;
                        client.close();
                        res.status(200).json({
                            msg: "Successfully assigned students to mentor!."
                        })
                    })
                })
            })

        }
    }
})



app.post('/liststudents', (req, res) => {
    if (req.body.mentorId == undefined)
        res.status(400).json({
            msg: "Mentor Id missing."
        })
    else {
        let mid = mongodb.ObjectID(req.body.mentorId);
        mongoClient.connect(dbURL, (err, client) => {
            if (err) throw err;
            let db = client.db('mentorAssign');
            db.collection("mentor").aggregate([{ $match: { _id: mid } }, {
                $lookup: {
                    from: 'student',
                    localField: 'students',
                    foreignField: '_id',
                    as: 'students'
                }
            }]).toArray((err, data) => {
                if (err) throw err;
                console.log(data[0]['students']);
                client.close();
                res.status(200).json(data[0]['students'])
            })
        })
    }
})
app.get('/listofmentors', (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        let db = client.db('mentorAssign');
        db.collection("mentor").aggregate([{
            $lookup: {
                from: 'student',
                localField: 'students',
                foreignField: '_id',
                as: 'students'
            }
        }]).toArray((err, data) => {
            if (err) throw err;
            client.close();
            res.status(200).json(data)
        })

    })


});
app.get('/listofstudents', (req, res) => {

    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        let db = client.db('mentorAssign');
        db.collection("student").aggregate([{
            $lookup: {
                from: 'mentor',
                localField: 'mentor',
                foreignField: '_id',
                as: 'mentor'
            }
        }]).toArray((err, data) => {
            if (err) throw err;
            client.close();
            res.status(200).json(data)
        })

    })

});
app.listen(port, () => {
    console.log('app running on', port)
})
