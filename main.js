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
app.use('/uploads', express.static('uploads'));

const multer = require("multer");



//session system
const session = require('express-session');
const { render } = require("ejs");

app.use(session({
    secret: 'curechain_secret',
    resave: false,
    saveUninitialized: false,
     rolling: true,
    cookie: {
        maxAge: 60 * 60 * 1000   // ⏰ 5 minutes
    }
}));

app.use((req, res, next) => {

    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    next();

});

// main routing
app.get("/", (req, res) => {
    // If user is already logged in, redirect to their dashboard
    if (req.session.user) {
        if (req.session.type === 'donor') {
            return res.redirect('/donordass');
        } else if (req.session.type === 'ngo') {
            return res.redirect('/ngodassboard');
        }
    }
    // If admin is logged in, redirect to admin dashboard
    if (req.session.admin) {
        return res.redirect('/admindass');
    }
    res.render("index", {
        user: null,
        userType: null
    });
});

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "curechain",
    password: "ayush123@"
});

// Run database migrations for new columns safely
connection.query("ALTER TABLE donors ADD COLUMN document VARCHAR(255) DEFAULT NULL", (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.log("DB setup: ", err.message);
});
connection.query("ALTER TABLE ngos ADD COLUMN document VARCHAR(255) DEFAULT NULL", (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.log("DB setup: ", err.message);
});

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }

});

const upload = multer({
    storage: storage,

    fileFilter: (req, file, cb) => {

        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "application/pdf"
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG, and PDF allowed"));
        }

    }

});



// connection.end();ll

app.get("/usersLogin", (req, res) => {
    if (req.session.user) {
        if (req.session.type === 'donor') {
            return res.redirect('/donordass');
        } else if (req.session.type === 'ngo') {
            return res.redirect('/ngodassboard');
        }
    }
    res.render("mainlogin");
});
// app.post("/usersLogin", (req, res) => {
//   let { email, password } = req.body;
//   console.log(email);
//   console.log(password);
// })



// main routing

let port = 4040;

app.post('/usersLogin', upload.single('document'), (req, res) => {

    const { type } = req.body;
    const document = req.file ? req.file.filename : null;

    //  DONOR REGISTER 
    if (type === 'donor') {

        const { name, email, password, phone, address, age } = req.body;

        if (!email.endsWith('.com')) {
            return res.redirect('/usersLogin?error=' + encodeURIComponent("Invalid email. Only .com domains are allowed! ❌"));
        }

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
                (donor_id, name, email, password, phone, address, age, document, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            `;

            connection.query(sql, [newId, name, email, password, phone, address, age, document], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.redirect('/usersLogin?error=' + encodeURIComponent("Error registering donor. Email might already be in use! ❌"));
                }

                res.redirect('/usersLogin?registeredEmail=' + encodeURIComponent(email));
            });

        });
    }

    // NGO REGISTER 
    else if (type === 'ngo') {

        const { ngo_name, registration_number, email, password, contact_person, phone, address, description } = req.body;

        if (!email.endsWith('.com')) {
            return res.redirect('/usersLogin?error=' + encodeURIComponent("Invalid email. Only .com domains are allowed! ❌"));
        }

        connection.query("SELECT ngo_id FROM ngos ORDER BY id DESC LIMIT 1", (err, result) => {

            let newId = "N001";

            if (result.length > 0) {
                let lastId = result[0].ngo_id;
                let num = parseInt(lastId.substring(1)) + 1;
                newId = "N" + String(num).padStart(3, '0');
            }

            const sql = `
                INSERT INTO ngos 
                (ngo_id, ngo_name, registration_number, email, password, contact_person, phone, address, description, document, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            `;

            connection.query(sql, [newId, ngo_name, registration_number, email, password, contact_person, phone, address, description, document], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.redirect('/usersLogin?error=' + encodeURIComponent("Error registering NGO. Email or registration number might already be in use! ❌"));
                }

                res.redirect('/usersLogin?registeredEmail=' + encodeURIComponent(email));
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
                return res.redirect('/usersLogin?error=' + encodeURIComponent("Database Error ❌"));
            }

            if (donorResult.length > 0) {
                if (donorResult[0].status !== 'approved') {
                    return res.redirect('/usersLogin?error=' + encodeURIComponent("Admin approval pending. Please wait until your account is verified. ⏳"));
                }

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
                        return res.redirect('/usersLogin?error=' + encodeURIComponent("Database Error ❌"));
                    }

                    if (ngoResult.length > 0) {
                        if (ngoResult[0].status !== 'approved') {
                            return res.redirect('/usersLogin?error=' + encodeURIComponent("Admin approval pending. Please wait until your account is verified. ⏳"));
                        }

                        // ✅ NGO login
                        req.session.user = ngoResult[0];
                        req.session.type = 'ngo';

                        return res.redirect('/ngodassboard');
                    }

                    // ❌ dono me nahi mila
                    return res.redirect('/usersLogin?error=' + encodeURIComponent("Invalid Email or Password ❌"));
                }
            );
        }
    );
});

app.get("/update-password", (req, res) => {
    res.render('updatepassword');
});

app.post("/update-password", (req, res) => {

    const { old_pass, reset_email, npassword, cpassword } = req.body;

    // confirm password check
    if (npassword !== cpassword) {
        return res.send("Passwords do not match ❌");
    }

    // 🔹 donor check
    connection.query(
        "SELECT * FROM donors WHERE email=?",
        [reset_email],
        (err, donorResult) => {

            if (err) {
                console.log(err);
                return res.send("DB Error");
            }

            // donor found
            if (donorResult.length > 0) {

                if (donorResult[0].status !== 'approved') {
                    return res.send("Admin approval pending ❌");
                }

                const donor = donorResult[0];

                // old password verify
                if (donor.password !== old_pass) {
                    return res.send("Old password incorrect ❌");
                }

                // update donor password
                connection.query(
                    "UPDATE donors SET password=? WHERE email=?",
                    [npassword, reset_email],
                    (err, result) => {

                        if (err) {
                            console.log(err);
                            return res.send("DB Error");
                        }

                        return res.send("Password updated successfully ✅");
                    }
                );

            } else {

                // 🔹 NGO check
                connection.query(
                    "SELECT * FROM ngos WHERE email=?",
                    [reset_email],
                    (err, ngoResult) => {

                        if (err) {
                            console.log(err);
                            return res.send("DB Error");
                        }

                        // NGO found
                        if (ngoResult.length > 0) {

                            if (ngoResult[0].status !== 'approved') {
                                return res.send("Admin approval pending ❌");
                            }

                            const ngo = ngoResult[0];

                            // old password verify
                            if (ngo.password !== old_pass) {
                                return res.send("Old password incorrect ❌");
                            }

                            // update NGO password
                            connection.query(
                                "UPDATE ngos SET password=? WHERE email=?",
                                [npassword, reset_email],
                                (err, result) => {

                                    if (err) {
                                        console.log(err);
                                        return res.send("DB Error");
                                    }

                                    return res.send("Password updated successfully ✅");
                                }
                            );

                        } else {

                            return res.send("Email not found ❌");

                        }
                    }
                );
            }
        }
    );
});


// app.get('/donordass', (req, res) => {
//     res.render('donordassboard');

// });

app.get('/donordass', (req, res) => {

    if (!req.session.user) {
        return res.redirect('/usersLogin');
    }

    const donor_id = req.session.user.donor_id;

    // donor medicines
    connection.query(

        "SELECT * FROM medicines WHERE donor_id=?",

        [donor_id],

        (err, medicines) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            // NGO requests
            connection.query(

                `
                SELECT requests.status,

                medicines.medicine_name,
                medicines.quantity,

                ngos.ngo_name

                FROM requests

                JOIN medicines
                ON requests.medicine_id = medicines.id

                JOIN ngos
                ON requests.ngo_id = ngos.ngo_id

                WHERE medicines.donor_id=?
                `,

                [donor_id],

                (err, requestedMedicines) => {

                    if (err) {
                        console.log(err);
                    }

                    res.render('donordassboard', {

                        user: req.session.user,
                        medicines,
                        requestedMedicines

                    });

                }

            );

        }

    );

});





// ngo ke liye

// app.get("/ngodassboard", (req, res) => {

//     if (!req.session.user) {
//         return res.redirect("/userlogin");
//     }

//     const user = req.session.user;

//     // 🔴 yaha DB se data laana hai
//     const counts = {
//         new: 0,
//         approved: 0,
//         completed: 0,
//         stock: 0
//     };

//     const requests = [];
//     const approved = [];
//     const completed = [];
//     const stock = [];

//     res.render("ngodassboard", {
//         user,
//         counts,
//         requests,
//         approved,
//         completed,
//         stock
//     });

// });

app.get("/ngodassboard", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/usersLogin");
    }

    const ngo_id = req.session.user.ngo_id;

    // approved medicines
    connection.query(

        `
SELECT medicines.*,

donors.name,

requests.status

FROM medicines

LEFT JOIN donors
ON medicines.donor_id = donors.donor_id

LEFT JOIN requests
ON medicines.id = requests.medicine_id
AND requests.ngo_id='${ngo_id}'

WHERE medicines.status='approved'

AND
(
    requests.status IS NULL
    OR
    requests.status='pending'
)
`,

        (err, requests) => {

            if (err) {
                console.log(err);
            }

            // approved requests
            connection.query(

                `
                SELECT requests.*,

                medicines.medicine_name,
                medicines.quantity,

                donors.name AS donor_name,
                donors.phone,
                donors.address

                FROM requests

                JOIN medicines
                ON requests.medicine_id = medicines.id

                JOIN donors
                ON medicines.donor_id = donors.donor_id

                WHERE requests.ngo_id=?
                AND requests.status='approved'
                `,

                [ngo_id],

                (err, approved) => {

                    if (err) {
                        console.log(err);
                    }

                    res.render("ngodassboard", {

                        user: req.session.user,

                        counts: {
                            new: requests.length,
                            approved: approved.length,
                            completed: 0,
                            stock: 0
                        },

                        requests,
                        approved,
                        completed: [],
                        stock: []

                    });

                }

            );

        }

    );

});


app.get('/NGOPatnerships', (req, res) => {
    res.render('work2');
});

app.get('/Safe&Verified', (req, res) => {
    res.render('work3');
});

app.get('/GlobalImpact', (req, res) => {
    res.render('work4');
});

app.get('/easydonation', (req, res) => {
    res.render('work1');
});

// console.log(req.session);

// app.post('/logout', (req, res) => {
//     req.session.destroy(() => {
//         res.redirect('/usersLogin');
//     });
// });

// logout route

app.post('/logout', (req, res) => {

    // admin logout
    if (req.session.admin) {

        req.session.destroy(() => {
            res.redirect('/adminlogin');
        });

    }

    // donor / ngo logout
    else {

        req.session.destroy(() => {
            res.redirect('/usersLogin');
        });

    }

});



app.post("/", (req, res) => {
    const { name, email, message } = req.body;

    const sql = "INSERT INTO feedbacks (name, email, message) VALUES (?, ?, ?)";

    connection.query(sql, [name, email, message], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error saving feedback");
        }

        res.redirect('/')
    });
});

app.get("/adminlogin", (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admindass');
    }
    res.render("adminlogin");
});

app.post("/admin-login", (req, res) => {

    const { email, password } = req.body;

    connection.query(
        "SELECT * FROM admins WHERE email=? AND password=?",
        [email, password],

        (err, result) => {

            if (err) {
                console.log(err);
                return res.redirect('/adminlogin?error=' + encodeURIComponent("Database Error ❌"));
            }

            if (result.length > 0) {

                req.session.admin = result[0];

                res.redirect("/admindass");

            } else {
                res.redirect('/adminlogin?error=' + encodeURIComponent("Invalid Email or Password ❌"));
            }

        }
    );

});

// app.get("/admindass", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin-login");
//     }

//     res.render('mainadmin', {
//         admin: req.session.admin
//     });

// });

app.get("/admindass", (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/adminlogin");
    }

    // NGOs
    connection.query(
        "SELECT * FROM ngos",

        (err, ngos) => {

            if (err) {
                console.log(err);
            }

            // Donors
            connection.query(
                "SELECT * FROM donors",

                (err, donors) => {

                    if (err) {
                        console.log(err);
                    }

                    // Medicines
                    connection.query(

                        `
                        SELECT medicines.*, donors.name

                        FROM medicines

                        LEFT JOIN donors
                        ON medicines.donor_id = donors.donor_id

                        ORDER BY medicines.id DESC
                        `,

                        (err, medicines) => {

                            if (err) {
                                console.log(err);
                            }

                            // Requests
                            connection.query(

                                `
                                SELECT requests.*,

                                medicines.medicine_name,
                                medicines.quantity,

                                donors.name AS donor_name,

                                ngos.ngo_name

                                FROM requests

                                JOIN medicines
                                ON requests.medicine_id = medicines.id

                                JOIN donors
                                ON medicines.donor_id = donors.donor_id

                                JOIN ngos
                                ON requests.ngo_id = ngos.ngo_id
                                `,

                                (err, requests) => {

                                    if (err) {
                                        console.log(err);
                                    }

                                    res.render("mainadmin", {

                                        admin: req.session.admin,
                                        ngos,
                                        donors,
                                        medicines,
                                        requests

                                    });

                                }

                            );

                        }

                    );

                }

            );

        }

    );

});
app.post(
    "/donate",
    upload.single("image"),
    (req, res) => {

        if (!req.session.user) {
            return res.redirect("/usersLogin");
        }

        const {
            med,
            type,
            qty,

            exp,
            desc
        } = req.body;

        const donor_id = req.session.user.donor_id;

        // expiry validation

        let today = new Date();

        let expiry = new Date(exp);

        // 🔥 current date + 5 months
        let minExpiry = new Date();

        minExpiry.setMonth(minExpiry.getMonth() + 5);

        // ❌ validation
        if (expiry <= minExpiry) {

            return res.send(
                "<script>alert('Medicine expiry must be at least 5 months ahead ❌'); window.location.href='/donordass';</script>"
            );

        }

        // quantity validation

        if (qty <= 0) {
            return res.send("<script>alert('Invalid quantity ❌'); window.location.href='/donordass';</script>");
        }

        const image = req.file.filename;

        const sql = `
        INSERT INTO medicines
        (
            medicine_name,
            medicine_type,
            quantity,
            
            expiry_date,
            description,
            image,
            donor_id,
            status
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        connection.query(
            sql,
            [
                med,
                type,
                qty,

                exp,
                desc,
                image,
                donor_id,
                'pending'
            ],

            (err, result) => {

                if (err) {
                    console.log(err);
                    return res.send("Medicine insert error");
                }

                res.redirect("/donordass");

            }
        );

    }
);

app.get("/approve-donor/:id", (req, res) => {

    const id = req.params.id;

    connection.query(

        "UPDATE donors SET status='approved' WHERE donor_id=?",

        [id],

        (err, result) => {

            if (err) {
                console.log(err);
            }

            res.redirect("/admindass");

        }

    );

});

app.get("/approve-ngo/:id", (req, res) => {

    const id = req.params.id;

    connection.query(

        "UPDATE ngos SET status='approved' WHERE ngo_id=?",

        [id],

        (err, result) => {

            if (err) {
                console.log(err);
            }

            res.redirect("/admindass");

        }

    );

});

app.get("/reject-donor/:id", (req, res) => {
    const id = req.params.id;
    connection.query("UPDATE donors SET status='rejected' WHERE donor_id=?", [id], (err, result) => {
        if (err) console.log(err);
        res.redirect("/admindass");
    });
});

app.get("/reject-ngo/:id", (req, res) => {
    const id = req.params.id;
    connection.query("UPDATE ngos SET status='rejected' WHERE ngo_id=?", [id], (err, result) => {
        if (err) console.log(err);
        res.redirect("/admindass");
    });
});

app.get("/approve-medicine/:id", (req, res) => {

    const id = req.params.id;

    connection.query(

        "UPDATE medicines SET status='approved' WHERE id=?",
        [id],

        (err, result) => {

            if (err) {
                console.log(err);
            }

            res.redirect("/admindass");

        }

    );

});


app.get("/reject-medicine/:id", (req, res) => {

    const id = req.params.id;

    connection.query(

        "UPDATE medicines SET status='rejected' WHERE id=?",

        [id],

        (err, result) => {

            if (err) {
                console.log(err);
            }

            res.redirect("/admindass");

        }

    );

});

app.get("/send-request/:id", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/usersLogin");
    }

    const medicine_id = req.params.id;

    const ngo_id = req.session.user.ngo_id;

    connection.query(

        `
        INSERT INTO requests
(medicine_id, ngo_id, status)

        VALUES (?, ?, ?)
        `,

        [medicine_id, ngo_id, 'pending'],

        (err, result) => {

            if (err) {
                console.log(err);
            }

            res.redirect("/ngodassboard");

        }

    );

});

app.get("/approve-request/:id", (req, res) => {

    const id = req.params.id;

    connection.query(

        "UPDATE requests SET status='approved' WHERE id=?",

        [id],

        (err, result) => {

            if (err) {
                console.log(err);
            }

            res.redirect("/admindass");

        }

    );

});

app.get("/reject-request/:id", (req, res) => {

    const id = req.params.id;

    connection.query(

        "UPDATE requests SET status='rejected' WHERE id=?",

        [id],

        (err, result) => {

            if (err) {
                console.log(err);
            }

            res.redirect("/admindass");

        }

    );

});


app.listen(port, () => {

    console.log("ok good start");

});

// ayush123

