const User = require("../../classes/User");

const connectChannel = async (req, res) => {
    const token = req.get("authToken");
    const username = await User.getUsernameByToken(token);
    console.log(`Successful connection from ${username}`)
    res.status(200);
    res.send();
}

module.exports = connectChannel;