const express = require("express");
const app = express();
const ejs = require("ejs");

app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.use(express.urlencoded({ extended: false }));
// change the background of all pages using a CSS file
app.use(express.static(__dirname));

app.listen(8080);
console.log('Server running at http://localhost:8080/');

// It uses Mongoose to store all the data instead of plain MongoDB
var mongoose = require('mongoose');

// It has two collections: Doctors and Patients

// Each Doctor has the following fields (Doctor Schema):
var doctorSchema = mongoose.Schema({

// full name: an object has
// first name: cannot be empty
// last name
    fullName: {
        firstName: {
            type: String,
            required: true
        },
        lastName: String
    },
// date of birth (date)
    dob: Date,
// Address: Object has
// State: min 2, max 3 characters
// Suburb
// Street
// Unit
    address: {
        state: {
            type: String,
            minLength: 2,
            maxLength: 3
        },
        suburb: String,
        street: String,
        unit: String
    },
// numPatients: a positive number represents the number of patients a doctor has seen so far
    numPatients: {
        type: Number,
        min: 0
    }
});
const Doctor = mongoose.model('Doctor', doctorSchema);

// Each Patient has the following fields (Patient Schema):
var patientSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    // full name (string): cannot be empty
    fullName: {
        type: String,
        required: true
    },
    // doctor (ObjectID): _id of the patient's doctor
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    // age (number): a number between 0 and 120
    age: {
        type: Number,
        validate: {
            validator: function (ageValue) {
                return ageValue >= 0 && ageValue <= 120;
            },
            message: 'Age should be a number between 0 and 120'
        }
    },
    // data of visit (date): default to the current date
    dov: {
        type: Date,
        default: Date.now()
    },
    // case description (string): a string with at least 10 characters
    desc: {
        type: String,
        minLength: 10
    }
});
const Patient = mongoose.model('Patient', patientSchema);

// Pages


let url='mongodb://localhost:27017/lab6';
mongoose.connect(url, function (err) {});

// Insert a new Doctor: adds a new doctor to ‘doctors’ collection
app.get("/adddoctor", function (req, res) {
    res.sendFile(__dirname + "/addDoctor.html");
});

app.post("/adddoctor", function (req, res) {
    var newDoctor = new Doctor({
        fullName: {
            firstName: req.body.firstName,
            lastName: req.body.lastName
        },
        dob: req.body.dob,
        address: {
            state: req.body.state,
            suburb: req.body.suburb,
            street: req.body.street,
            unit: req.body.unit
        },
        numPatients: req.body.numPatient
    });

    newDoctor.save(function (err){
        if (err) throw err;
        console.log('Doctor successfully Added to DB');
    });

// redirect the client to the get all patients page after the insert, update and delete operations.
    res.redirect('/getAllPatients');
});

// Get all doctors page: shows all the doctors in a table format (including the _id field)
app.get("/getalldoctors", function (req, res) {
    Doctor.find({}, function (err, docs) {
        res.render(__dirname + '/getAllDoctors.html', {doctorDB: docs});
    });
});

// Insert new patient page: adds a new patient to the Patient collection. (Hint: Get the Doctor’s _id from the  ‘Get all doctors page’ manually (copy&paste)). The server has to increment (update) the numPatients of that doctor by one.
// Insert a new Doctor: adds a new doctor to ‘doctors’ collection
app.get("/addpatient", function (req, res) {
    res.sendFile(__dirname + "/addPatient.html");
});

app.post("/addpatient", function (req, res) {
    var newPatient = new Patient({
        fullName: req.body.fullName,
        doctor: req.body.docID,
        age: req.body.age,
        desc: req.body.desc
    });

    // default value to work
    if (req.body.dov) {
        newPatient.dov = req.body.dov;
    }

    newPatient.save(function (err){
        if (err) throw err;
        console.log('Patient successfully Added to DB');
    });
// redirect the client to the get all patients page after the insert, update and delete operations.
    res.redirect('/getAllPatients');
});

// Get all patients page. This page must show all the patients in a table format including the first and last names of their doctors.
app.get("/getallpatients", function (req, res) {
    Patient.find({}, function (err, docs) {
        res.render(__dirname + '/getAllPatients.html', {patientDB: docs});
    });

});

app.get("/deletepatient", function (req, res) {
    res.sendFile(__dirname + "/deletePatient.html");
});
// Delete patient by fullName: the page takes a fullName as input and deletes its patient from the DB
app.post("/deletepatient", function (req, res) {
    Patient.deleteOne({ 'fullName': req.body.fullName }, function (err, doc) {
        console.log(doc);
    });
// redirect the client to the get all patients page after the insert, update and delete operations.
    res.redirect('/getAllPatients');
});


app.get("/updatedoctor", function (req, res) {
    res.sendFile(__dirname + "/updateDoctor.html");
});
// Update Doctor numPatients by _id: the page takes as input the doctor's _id and the numPatients.
// It sets the new number of patients to the doctor with the given _id.
app.post("/updatedoctor", function (req, res) {
    Doctor.updateOne({ '_id': req.body.id, 'numPatients': req.body.oldNum},
        { $set: { 'numPatients': req.body.newNum } }, function (err, doc) {
        console.log(doc);
    });

// redirect the client to the get all patients page after the insert, update and delete operations.
    res.redirect('/getAllPatients');
});


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/home.html");
});

// Invalid Data: if an error occurs, redirect the user to this page.
app.use(function (req, res){
    res.sendFile(__dirname + '/invalidData.html');
});

// Deploy your application to a VM in your GCP account.


