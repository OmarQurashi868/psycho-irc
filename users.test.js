const { registerUser } = require("./routes/users");
const User = require("./classes/user");

jest.mock("./classes/user")

const mockRequest = {
    body: {
        username: "johnDoe",
        password: "testing"
    }
}
const mockResponse = {
    status: () => {
        jest.fn((x) => x);
        return this;
    },
    send: () => {
        jest.fn((x) => x);
        return this;
    }
}

it("Should return a status code of 400 when user exists", async () => {

    User.find.mockResolvedValue(() => ({
        username: "johnDoe",
        password: "testingHashed"
    }));

    await registerUser(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalledTimes(1);
});