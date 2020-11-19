const express = require('express')
const app = express()
const { MongoClient, ObjectId } = require("mongodb");

//url and client for connection to database
const url = "mongodb+srv://Kuro:abc1234@cluster0.hmns0.mongodb.net/class?retryWrites=true&w=majority"
const client = new MongoClient(url, { useUnifiedTopology: true });

// The database to use
const dbName = "class";


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));

let db, studentDb;
//function for connection to databse and run the server
run().catch(console.dir);

//my Class Student
class Student { 
    constructor(firstname, surname, nblate, paymentdone){
        this.firstname = firstname;
        this.surname = surname;
        this.nblate = nblate;
        this.paymentdone = paymentdone;
    }
}

//home page route
app.get('/', (req, res) => {
    // console.log(studentDb)
    res.send('My crud')
})

//get student by id router
app.get('/student/:id', (req, res) => {
    console.log('You are in the student route');
    let id = req.params.id;
    async function findstudent() {
        try{
            //get student by id function mongoDB findOne()
            const foundstudent = await  studentDb.findOne({_id:ObjectId(id)})
            res.json(foundstudent)
        } catch(err){
            // res.sendStatus(404);
            res.send('Invalid user id');
        }
    };
    findstudent();
})

//get all students
app.get('/student', (req,res) => {
    console.log('Getting all students');
    //get all student by putting them in an array that can be use
    async function getAllstudents() {
        let students = [];
        const studentget = studentDb.find();
        //for each student in studentget you push them in the array students
        await studentget.forEach(student => {
            students.push(student);
        });
        res.send(students);
    }

    getAllstudents();
});

//post student route
app.post('/student', (req, res) =>{
    console.log('I have received a post request in the /student route');
    //create a student object
    let student = new Student(req.body.firstname, req.body.surname, req.body.nblate, req.body.paymentdone);
    //check the object is good
    console.log(student);
    //insert it to the database
    studentDb.insertOne(student);
    res.sendStatus(200)
})


// student router for the update
app.put('/student', (req, res) => {
    console.log(' student router for update ');
    //update by checking if the student exist in the database and if it exist update it
    async function updatestudent() {
        try{
            const foundstudent = await  studentDb.findOne({"_id": ObjectId(req.body.id)})
            //if the student is found edit it and send a message to the user
            if(foundstudent !== null){
                //create object student
                let student = new Student(
                    foundstudent.firstname,
                    foundstudent.surname,
                    foundstudent.nblate,
                    foundstudent.paymentdone,
                    );
                //change the value in them
                student.firstname = req.body.firstname;
                student.surname = req.body.surname;
                student.nblate = parseInt(req.body.nblate);
                student.paymentdone = req.body.paymentdone;
                console.log(student);
                try{
                    //update with updateOne()
                    const updateResult = await studentDb.updateOne(
                        {"_id": ObjectId(req.body.id)},
                        {$set:student})
                } catch(err){
                    console.log(err.stack)
                }
                //check if it works or not
                res.send("The student was updated");
            } else {
                //if the student is not found send a message to the user saying that this entry doe not exist
                res.send("Te student was not updated");
            }}catch(err){
            res.send("Object id is invalid")
        }
    }
    updatestudent();

});
// student router to delete
app.delete('/student', (req, res) =>{

    console.log('student router to delete one student');
    //mongoDB function to delete based on the object id
    studentDb.deleteOne({"_id": ObjectId(req.body.id)});
    //checking if the student was deleted
    async function findstudent() {
        //mongoDB function to find by id
        const foundstudent = await  studentDb.findOne({"_id": ObjectId(req.body.id)})
        if(foundstudent !== null){
            res.send("The entry was not deleted")
        }
        res.send("The entry was deleted")
    }
    findstudent();
});

//code used to start our application
async function run() {
    // try to start the application only if the database is connected correctly
    try {
        //connect to the database
        await client.connect();

        //connect to the right database ("Class")
        db = client.db(dbName);

        //get reference to our student "table"
        studentDb = db.collection("student");

        //start listening to requests (get/post/etc.)
        app.listen(3000);
    } catch (err) {
        //in case we couldn't connect to our database throw the error in the console
        console.log(err.stack);
    }
}


