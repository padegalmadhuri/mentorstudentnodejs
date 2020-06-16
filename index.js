const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const bodyParser = require('body-parser')
const cors = require('cors')

app.use(bodyParser.json())
app.use(cors())

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
        mentor.push({
            id: mentorId,
            name: req.body.name,
            age: req.body.age,
            role: req.body.role,
            phoneNo: req.body.phoneNo,
            students: []
        })
        mentorId++;
        res.status(200).json({
            msg: "Successfully added mentor"
        })
    }
})

app.post('/students', (req, res) => {
    if (req.body.name == '' || req.body.name == undefined || req.body.batchNo == '' || req.body.batchNo == undefined || req.body.phoneNo == '' || req.body.phoneNo == undefined)
        res.status(400).json({
            msg: "Name or Batch or Phone number missing."
        })
    else {
        student.push({
            id: studentId,
            name: req.body.name,
            batchNo: req.body.batchNo,
            course: req.body.course,
            phoneNo: req.body.phoneNo,
            mentor: ""
        })
        studentId++;
        res.status(200).json({
            msg: "Successfully added student"
        })
    }
})


app.post('/assignstudent', (req, res) => {
    if (req.body.mentorId == undefined || req.body.students == undefined)
        res.status(400).json({
            msg: "Mentor or Students missing."
        })
    else {
        let mentors = req.body.mentorId;
        let studentIds = req.body.students;
        for (let i of studentIds) {
            student[i].mentor = JSON.parse(JSON.stringify(mentor[mentors]));
            mentor[mentors].students.push(JSON.parse(JSON.stringify(student[i])))
        }
        console.log(mentor);
        console.log(student);
        res.status(200).json({
            msg: "Successfully assigned students to mentor!."
        })
    }
})



app.post('/liststudents', (req, res) => {
    if (req.body.mentorId == undefined)
        res.status(400).json({
            msg: "Mentor Id missing."
        })
    else {
        console.log(typeof(req.body.mentorId));
        if (mentor.length == 0) {
            res.json({
                "msg": "No mentor available"
            })
        } else {
            console.log(mentor[req.body.mentorId]);
            res.status(200).json(mentor[req.body.mentorId].students)
        }

    }
})
app.get('/listofmentors', (req, res) => {

    res.status(200).json(mentor);

});
app.get('/listofstudents', (req, res) => {

    res.status(200).json(student);

});
app.listen(port, () => {
    console.log('app running on', port)
})
