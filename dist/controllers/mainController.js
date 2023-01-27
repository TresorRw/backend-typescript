const Users = require('../models/userModel');
const Addres = require('../models/addressModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Creating a token
const duration = 5 * 60 * 60 * 24;
const createToken = (id) => {
    return jwt.sign({
        id
    }, "personal-brand-app", {
        expiresIn: duration,
    });
};
module.exports.signup_post = async (req, res) => {
    let { email, password } = req.body;
    if (email && password) {
        let checkExists = await Users.findAll({ where: { email } });
        if (checkExists.length == 0) {
            const salt = await bcrypt.genSalt();
            const token = createToken(email);
            password = await bcrypt.hash(password, salt);
            Users.create({ email: email, user_pwd: password })
                .then(response => {
                res.cookie('usrtk', token, { maxAge: duration * 1000 });
                res.status(201).json({ status: 201, message: "User is created", data: response });
            })
                .catch(err => {
                res.status(400).json({ status: 400, message: "Error", errors: err });
            });
        }
        else {
            res.status(400).json({ status: 400, message: "Email already used!" });
        }
    }
    else {
        res.status(400).json({ status: 400, message: "Provide all inputs" });
    }
};
module.exports.renderProfile = async (req, res) => {
    const token = req.cookies.usrtk;
    if (token) {
        jwt.verify(token, 'personal-brand-app', async (err, decodedToken) => {
            if (err) {
                res.redirect('/');
            }
            else {
                const userEmail = decodedToken.id;
                const user = await Users.findOne({ where: { email: userEmail } });
                res.render('../views/profile', { user });
            }
        });
    }
    else {
        res.redirect('/');
    }
};
module.exports.renderAccount = async (req, res) => {
    const token = req.cookies.usrtk;
    if (token) {
        jwt.verify(token, 'personal-brand-app', async (err, decodedToken) => {
            if (err) {
                res.redirect('/');
            }
            else {
                const userEmail = decodedToken.id;
                const userAddress = await Addres.findOne({ where: { email: userEmail } });
                console.log(await userAddress);
                // if(await userAddress.length != 0) {
                //     console.log('Address found!')
                // } else {
                //     console.log('Address not found');
                // }
            }
        });
    }
    else {
        res.redirect('/');
    }
};
module.exports.logUser = async (req, res) => {
    let { email, password } = req.body;
    let isPasswordTrue;
    if (email && password) {
        let checkExists = await Users.findOne({ where: { email } });
        if (await checkExists) {
            isPasswordTrue = await bcrypt.compare(password, checkExists.user_pwd);
            if (isPasswordTrue) {
                const token = createToken(email);
                res.cookie('usrtk', token, { maxAge: duration * 1000 });
                res.status(200).json({ status: 200, message: "Logged in succesfully" });
            }
            else {
                res.status(400).json({ status: 400, message: 'Incorrect Password' });
            }
        }
        else {
            res.status(400).json({ status: 400, message: "Email is not registered!" });
        }
    }
    else {
        res.status(400).json({ status: 400, message: "Provide all inputs" });
    }
};
