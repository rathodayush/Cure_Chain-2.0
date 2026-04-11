// toggele ke liye//


const express = require("express");
const app = express();
const mysql = require("mysql2");
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.static('public'));

//session system

const session = require('express-session');

app.use(session({
    secret: 'curechain_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 5 * 60 * 1000   // ⏰ 5 minutes
    }
}));

// main routing
app.get("/", (req, res) => {
    res.render("index");
    // res.send("ok goodg");
});

const connection = mysql.createConnection({

    host: "localhost",
    user: "root",
    database: "curechain",
    password: "ayush123@"


});



// connection.end();

app.get("/usersLogin", (req, res) => {
    res.render("mainlogin");

});
// app.post("/usersLogin", (req, res) => {
//   let { email, password } = req.body;
//   console.log(email);
//   console.log(password);
// })



// main routing

let port = 4040;

app.post('/usersLogin', (req, res) => {

    const { type } = req.body;

    // ================= DONOR REGISTER =================
    if (type === 'donor') {

        const { name, email, password, phone, address, age } = req.body;

        // donor_id generate
        connection.query("SELECT donor_id FROM donors ORDER BY id DESC LIMIT 1", (err, result) => {

            let newId = "D001";

            if (result.length > 0) {
                let lastId = result[0].donor_id; // D005
                let num = parseInt(lastId.substring(1)) + 1;
                newId = "D" + String(num).padStart(3, '0');
            }

            const sql = `
                INSERT INTO donors 
                (donor_id, name, email, password, phone, address, age) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            connection.query(sql, [newId, name, email, password, phone, address, age], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.send("Error in donor insert");
                }

                res.redirect('/usersLogin');
            });

        });
    }

    // ================= NGO REGISTER =================
    else if (type === 'ngo') {

        const { ngo_name, registration_number, email, password, contact_person, phone, address, description } = req.body;

        connection.query("SELECT ngo_id FROM ngos ORDER BY id DESC LIMIT 1", (err, result) => {

            let newId = "N001";

            if (result.length > 0) {
                let lastId = result[0].ngo_id;
                let num = parseInt(lastId.substring(1)) + 1;
                newId = "N" + String(num).padStart(3, '0');
            }

            const sql = `
                INSERT INTO ngos 
                (ngo_id, ngo_name, registration_number, email, password, contact_person, phone, address, description) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            connection.query(sql, [newId, ngo_name, registration_number, email, password, contact_person, phone, address, description], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.send("Error in NGO insert");
                }

                res.redirect('/usersLogin');
            });

        });
    };

    // const { email, password, type: usertype } = req.body;

    // let table = usertype === 'donor' ? 'donors' : 'ngos';

    // connection.query(`SELECT * FROM ${table} WHERE email = ? AND password = ?`,
    //     [email, password], (err, result) => {

    //         if (result.length > 0) {

    //             if (result[0].status !== 'approved') {
    //                 return res.send("Admin approval pending ❌");
    //             }

    //             // ✅ session set
    //             req.session.user = result[0];
    //             req.session.type = type;

    //             console.log(req.session); // 👈 yaha check kar

    //             // ✅ redirect based on type
    //             if (type === 'donor') {
    //                 res.redirect('/donordassboard');
    //             } else {
    //                 // res.redirect('/ngo-dashboard');
    //             }

    //         } else {
    //             res.send("Invalid email/password ❌");
    //         }


    //     });

});

// app.post('/login', (req, res) => {

//     const { email, password, type } = req.body;

//     let table = type === 'donor' ? 'donors' : 'ngos';

//     connection.query(
//         `SELECT * FROM ${table} WHERE email=? AND password=?`,
//         [email, password],
//         (err, result) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("DB Error");
//             }

//             // ❌ user nahi mila
//             if (result.length === 0) {
//                 return res.send("Invalid Email or Password ❌");
//             }

//             // ✅ login success
//             let user = result[0];

//             // ✅ session set
//             req.session.user = user;
//             req.session.type = type;

//             // ✅ redirect
//             if (type === 'donor') {
//                 res.redirect('/donordass');
//             } else {
//                 res.redirect('/ngodass');
//             }
//         }
//     );
// });

app.post('/login', (req, res) => {

    const { email, password } = req.body;
    console.log("BODY DATA 👉", req.body);

    // 🔹 1. donor me check
    connection.query(
        "SELECT * FROM donors WHERE email=? AND password=?",
        [email, password],
        (err, donorResult) => {

            if (err) {
                console.log(err);
                return res.send("DB Error");
            }

            if (donorResult.length > 0) {

                // ✅ donor login
                req.session.user = donorResult[0];
                req.session.type = 'donor';

                return res.redirect('/donordass');
            }

            // 🔹 2. NGO me check
            connection.query(
                "SELECT * FROM ngos WHERE email=? AND password=?",
                [email, password],
                (err, ngoResult) => {

                    if (err) {
                        console.log(err);
                        return res.send("DB Error");
                    }

                    if (ngoResult.length > 0) {

                        // ✅ NGO login
                        req.session.user = ngoResult[0];
                        req.session.type = 'ngo';

                        return res.redirect('/ngodass');
                    }

                    // ❌ dono me nahi mila
                    res.send("Invalid Email or Password ❌");
                }
            );
        }
    );
});


app.get('/donordass', (req, res) => {
    res.render('donordassboard');

});


app.get('/NGOPatnerships', (req,res) => {
    res.render('work2');
});

app.get('/Safe&Verified', (req,res) => {
    res.render('work3');
});

app.get('/GlobalImpact', (req,res) => {
    res.render('work4');
});

app.get('/easydonation', (req,res) => {
    res.render('work1');
});

// console.log(req.session);



app.listen(port, () => {

    console.log("ok good start");

});





