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
    status: jest.fn((x) => x),

    send: jest.fn((x) => x),

}

it("Should return a status code of 400 when user exists", async () => {

    User.find.mockResolvedValue(() => ({
        username: "johnDoe",
        password: "testingHashed"
    }));

    await registerUser(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledTimes(1);
});