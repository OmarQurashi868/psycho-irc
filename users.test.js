const { registerUser } = require("./routes/users");
const bcrypt = require('bcrypt');
const User = require("./classes/user");
const Token = require("./classes/token");

jest.mock("./classes/user");
jest.mock("./classes/token");
jest.mock("bcrypt");

const mockRequest = {
    body: {
        username: "johnDoe",
        password: "testing",
        passwordConfirmation: "testing"
    }
}
const incompleteMockRequest = {
    body: {
        username: "johnDoe",
    }
}
const mockResponse = {
    status: jest.fn((x) => x),
    send: jest.fn((x) => x),
}

it("Should return a status code of 400 when properties are missing", async () => {

    await registerUser(incompleteMockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledTimes(1);
});

it("Should return a status code of 400 when user exists", async () => {

    User.find.mockResolvedValueOnce({
        username: "johnDoe",
        password: "testingHashed"
    });

    await registerUser(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledTimes(1);
});

it("Should return a status code of 200 when new user is created", async () => {

    User.find.mockResolvedValueOnce(undefined);
    User.insert.mockResolvedValueOnce(1);

    Token.deleteAllForUser.mockResolvedValueOnce();
    Token.insert.mockResolvedValueOnce();

    bcrypt.hash.mockResolvedValueOnce("testingHashed");

    await registerUser(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalledTimes(1);
});