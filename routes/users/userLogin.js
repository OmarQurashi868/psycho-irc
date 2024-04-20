const bcrypt = require("bcrypt");
const User = require("../../classes/User");
const Token = require("../../classes/Token");
const { generateToken } = require("../../utils/userAuth");

const loginUser = async (req, res) => {

    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    // eslint-disable-next-line no-undef
    const [username, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (!username || !password) {
        console.log(currentdate.toLocaleString()+ ` Failed login from ${username}: Missing username or password`);
        res.status(400);
        res.send({ message: "Missing username or password" });
        return
    }

    const userQueryResult = await User.find(username);
    const userNotExist = userQueryResult == undefined;
    if (userNotExist) {
        const message = "Username not found";
        console.log(currentdate.toLocaleString()+ " >"  + `Failed login from ${username}: ${message}`);
        res.status(404);
        res.send({ message });
        return;
    }

    const userPassword = userQueryResult['password']
    const isPasswordCorrect = await bcrypt.compare(password, userPassword);
    if (!isPasswordCorrect) {
        const message = "Password incorrect";
        console.log(currentdate.toLocaleString()+ " >" + ` Failed login from ${username}: ${message}`);
        res.status(401);
        res.send({ message });
        return;
    }

    const userId = userQueryResult['id'];

    await Token.deleteAllForUser(userId)
    const token = await generateToken(userId);

    console.log(currentdate.toLocaleString()+ " >"  +  ` User logged in successfully: ${username}`);
    res.status(200);
    res.send({ token });
}

module.exports = loginUser;