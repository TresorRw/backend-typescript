const Users = require("../models/userModel");
const user_address = require("../models/addressModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Creating a token
const duration = 5 * 60 * 60 * 24;
const createToken = (id) => {
    return jwt.sign({
        id,
    }, "personal-brand-app", {
        expiresIn: duration,
    });
};
module.exports.signup_post = async (req, res) => {
    let { email, password, names, profileLink } = req.body;
    if (email && password && names) {
        let checkExists = await Users.findAll({ where: { email } });
        if (checkExists.length == 0) {
            const salt = await bcrypt.genSalt();
            const token = createToken(email);
            password = await bcrypt.hash(password, salt);
            profileLink = profileLink ? profileLink : "";
            Users.create({ email: email, user_pwd: password, names, profileLink })
                .then((response) => {
                res.cookie("usrtk", token, { maxAge: duration * 1000 });
                res
                    .status(201)
                    .json({ status: 201, message: "User is created", data: response });
            })
                .catch((err) => {
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
module.exports.saveBeforeRedirect = async (req, res) => {
    const user = req.user;
    const email = req.user.email;
    const names = req.user.displayName;
    const profileLink = req.user.picture;
    let checkExists = await Users.findAll({ where: { email } });
    if (checkExists.length == 0) {
        const token = createToken(email);
        try {
            const newOne = await Users.create({
                email: email,
                user_pwd: "",
                names,
                profileLink,
            });
            res.cookie("usrtk", token, { maxAge: duration * 1000 });
            res.render("../views/profile", { user: newOne });
        }
        catch (error) {
            res.status(400).json({ status: 400, message: "You have eerror", error });
        }
    }
    else {
        res.status(400).json({ status: 400, message: "Email already used!" });
    }
};
module.exports.renderProfile = async (req, res) => {
    const token = req.cookies.usrtk;
    const googleAuth = req.user;
    if (token) {
        jwt.verify(token, "personal-brand-app", async (err, decodedToken) => {
            if (err) {
                res.redirect("/");
            }
            else {
                const userEmail = decodedToken.id;
                const user = await Users.findOne({ where: { email: userEmail } });
                res.render("../views/profile", { user });
            }
        });
    }
    else if (googleAuth) {
        const userEmail = googleAuth.email;
        const user = await Users.findOne({ where: { email: userEmail } });
        res.render("../views/profile", { user });
    }
    else {
        res.redirect("/");
    }
};
module.exports.renderAccount = async (req, res) => {
    const token = req.cookies.usrtk;
    const googleAuth = req.user;
    if (token) {
        jwt.verify(token, "personal-brand-app", async (err, decodedToken) => {
            if (err) {
                res.redirect("/");
            }
            else {
                const userEmail = decodedToken.id;
                const check = await user_address.findOne({
                    where: { email: userEmail },
                });
                if ((await check) == null || (await check) == "") {
                    res.render("../views/account", { prof: "new", email: userEmail });
                }
                else {
                    res.render("../views/account", { prof: check, email: userEmail });
                }
            }
        });
    }
    else if (googleAuth) {
        const userEmail = googleAuth.email;
        const check = await user_address.findOne({ where: { email: userEmail } });
        if ((await check) == null || (await check) == "") {
            res.render("../views/account", { prof: "new", email: userEmail });
        }
        else {
            res.render("../views/account", { prof: check, email: userEmail });
        }
    }
    else {
        res.redirect("/");
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
                res.cookie("usrtk", token, { maxAge: duration * 1000 });
                res.status(200).json({ status: 200, message: "Logged in succesfully" });
            }
            else {
                res.status(400).json({ status: 400, message: "Incorrect Password" });
            }
        }
        else {
            res
                .status(400)
                .json({ status: 400, message: "Email is not registered!" });
        }
    }
    else {
        res.status(400).json({ status: 400, message: "Provide all inputs" });
    }
};
module.exports.saveAddress = async (req, res) => {
    const email = req.body.email;
    const province = req.body.province;
    const district = req.body.district;
    const sector = req.body.sector;
    const cell = req.body.cell;
    const street = req.body.street;
    if (email && province && district && sector && cell && street) {
        const add = await user_address.create({
            email,
            province,
            district,
            sector,
            cell,
            street,
        });
        if (await add) {
            res
                .status(201)
                .json({ status: 201, message: "Profile saved.", prof: add });
        }
        else {
            res.status(400).json({ status: 400, message: "Something went wrong!" });
        }
    }
    else {
        res.status(400).json({ status: 400, message: "Please fill all fields!" });
    }
};
module.exports.signupError = (req, res) => {
    res.send("<h1>Error!</h1>");
};
