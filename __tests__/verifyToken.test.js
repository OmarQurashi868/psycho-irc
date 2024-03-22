const { verifyToken } = require("../utils/userAuth");
const Token = require("../classes/Token");
jest.mock("../classes/Token");

const incompleteMockRequest = {
    body: {
        username: "johnDoe",
        password: "testing",
    },
    get: jest.fn(() => undefined)
}
const mockRequest = {
    body: {
        username: "johnDoe",
        password: "testing",
    },
    get: jest.fn(() => "token")
}
const mockResponse = {
    status: jest.fn((x) => x),
    send: jest.fn((x) => x),
}
const next = jest.fn((x) => x);

it("Should return a status code of 400 if token is missing", async () => {
    await verifyToken(incompleteMockRequest, mockResponse, next);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledTimes(1);
});

it("Should return a status code of 401 if token is invalid", async () => {
    Token.find.mockResolvedValueOnce(undefined);
    await verifyToken(mockRequest, mockResponse, next);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.send).toHaveBeenCalledTimes(1);
});

it("Should call next() if token is present and valid", async () => {
    Token.find.mockResolvedValueOnce("token");
    await verifyToken(mockRequest, mockResponse, next);

    expect(next).toHaveBeenCalledTimes(1);
});