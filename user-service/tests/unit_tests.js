/**
 * Started as a unit test but became integration test
 * For the most part.
 */

const chai = require("chai");
const chaiHttp = require("chai-http");
const TestUtils = require("./test_utils");
const Utils = require("../src/utils/utils");
const pool = require("../src/config/db");
const waitPort = require("wait-port");

if (process.env.NODE_ENV === "test") {
    require("dotenv").config({ path: ".env.test" });
} else {
    require("dotenv").config();
}

/** Start the mock application.  */
const server = process.env.SERVER_ADDRESS;
// const server = require("../server");

chai.should();
chai.use(chaiHttp);

describe("Unit tests for user management", () => {
    let user1Token = "";
    before(async () => {
        try {
            await waitPort({ host: process.env.PG_HOST, port: Number(process.env.PG_PORT), timeout: 15000 })

            if (process.env.NODE_ENV === "test") {
                await TestUtils.initializeTestDatabase();
                console.log("initialized test database.");
            } else {
                await TestUtils.initializeDatabase();
                console.log("initialized database.");
            }
        } catch (err) {
            console.error("connection error", err.stack);
        }
    });

    it("Test user registration", (done) => {
        const user1 = {
            username: "test_username",
            password: "test_password",
            email: "test_email@test.com",
        };

        const admin = {
            username: "test_admin_username",
            password: "test_admin_password",
            email: "test_admin_email@test.com",
            adminStatus: true,
        };

        chai
            .request(server)
            .post("/auth/register")
            .send(user1)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.should.have.status(201);
                res.body.should.be.a("object");
                res.body.should.have.property("accessToken");
                res.body.should.have.property("userInfo");
                res.body.userInfo.username.should.be.equal(user1.username);
                res.body.userInfo.email.should.be.equal(user1.email);
                res.body.userInfo.adminStatus.should.be.equal(false);
                chai
                    .request(server)
                    .post("/auth/register")
                    .send(admin)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        res.should.have.status(201);
                        res.body.should.be.a("object");
                        res.body.should.have.property("accessToken");
                        res.body.should.have.property("userInfo");
                        res.body.userInfo.username.should.be.equal(admin.username);
                        res.body.userInfo.email.should.be.equal(admin.email);
                        res.body.userInfo.adminStatus.should.be.equal(true);
                        done();
                    });
            });
    });

    it("Should login user1", (done) => {
        const user1 = {
            username: "test_username",
            password: "test_password",
        };

        chai
            .request(server)
            .post("/auth/login")
            .send(user1)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a("object");
                res.body.should.have.property("accessToken");
                user1Token = res.body.accessToken;
                done();
            });
    });

    it("Should logout of user1", (done) => {
        const user1 = {
            username: "test_username",
        };

        chai
            .request(server)
            .get("/auth/logout")
            .set("Authorization", "Bearer " + user1Token)
            .send(user1)
            .end((err, res) => {
                res.should.have.status(200);
                /** The access token should not be valid now. */
                async () => {
                    await Utils.validateToken(user1Token).should.be.false;
                };
                done();
            });
    });

    it("Should change user1's information", (done) => {
        const user1 = {
            username: "test_username",
            password: "test_password",
            email: "modified@test.com",
        };
        chai
            .request(server)
            .post("/auth/login")
            .send(user1)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a("object");
                res.body.should.have.property("accessToken");
                user1Token = res.body.accessToken;

                chai
                    .request(server)
                    .put("/user")
                    .set("Authorization", "Bearer " + user1Token)
                    .send(user1)
                    .end((err, res) => {
                        res.should.have.status(201);
                        res.body.should.be.a("object");
                        res.body.email.should.be.equal(user1.email);

                        chai
                            .request(server)
                            .get("/user")
                            .set("Authorization", "Bearer " + user1Token)
                            .send({ username: user1.username })
                            .end((err, res) => {
                                res.should.have.status(201);
                                res.body.should.be.a("object");
                                res.body.email.should.be.equal(user1.email);
                                done(); // Signal end of test
                            });
                    });
            });
    });

    it("Should change user1's password", async () => {
        // Make this an async function
        const user1 = {
            username: "test_username",
            oldPassword: "test_password",
            newPassword: "new_password",
        };

        await new Promise((resolve, reject) => {
            chai
                .request(server)
                .put("/auth/change-password")
                .set("Authorization", "Bearer " + user1Token)
                .send(user1)
                .end((err, res) => {
                    if (err) return reject(err);
                    res.should.have.status(201);
                    res.body.should.be.a("object");
                    resolve();
                });
        });

        const loginWithOldPassword = new Promise((resolve, reject) => {
            chai
                .request(server)
                .post("/auth/login")
                .send({ username: user1.username, password: user1.oldPassword })
                .end((err, res) => {
                    if (err) return reject(err);
                    res.should.have.status(401);
                    resolve();
                });
        });

        const loginWithOldToken = new Promise((resolve, reject) => {
            chai
                .request(server)
                .put("/auth/change-password")
                .set("Authorization", "Bearer " + user1Token)
                .end((err, res) => {
                    if (err) return reject(err);
                    res.should.have.status(401);
                    resolve();
                });
        });

        const loginWithNewPassword = new Promise((resolve, reject) => {
            chai
                .request(server)
                .post("/auth/login")
                .send({ username: user1.username, password: user1.newPassword })
                .end((err, res) => {
                    if (err) return reject(err);
                    res.should.have.status(201);
                    res.body.should.be.a("object");
                    resolve();
                });
        });

        // Now we can await on all the promises, which will resolve when each request finishes
        await Promise.all([
            loginWithOldPassword,
            loginWithOldToken,
            loginWithNewPassword,
        ]);
    });

    after(async function () {
        if (process.env.NODE_ENV === "test") {
            await TestUtils.clearUserDatabase();
        }
    });
});

describe("Unit tests for profile management.", () => {
    let user1Token = "";
    let user1Info;
    before(async () => {
        try {
            await waitPort({ host: process.env.PG_HOST, port: Number(process.env.PG_PORT), timeout: 15000 })

            if (process.env.NODE_ENV === "test") {
                await TestUtils.initializeTestDatabase();
                console.log("initialized test database.");
            } else {
                await TestUtils.initializeDatabase();
                console.log("initialized database.");
            }
        } catch (err) {
            console.error("connection error", err.stack);
        }
    });

    it("Test profile creation", (done) => {
        const user1 = {
            username: "test_username",
            password: "test_password",
            email: "test_email@test.com",
        };

        const user1Profile = {
            username: "test_username",
            displayname: "test_displayname",
            birthdate: "1990-01-01",
        }

        chai
            .request(server)
            .post("/auth/register")
            .send(user1)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.should.have.status(201);
                res.body.should.be.a("object");
                res.body.should.have.property("accessToken");
                user1Token = res.body.accessToken;
                res.body.should.have.property("userInfo");
                user1Info = res.body.userInfo;
                res.body.userInfo.username.should.be.equal(user1.username);
                res.body.userInfo.email.should.be.equal(user1.email);
                res.body.userInfo.adminStatus.should.be.equal(false);

                chai.request(server)
                    .post("/user/profile")
                    .set("Authorization", "Bearer " + user1Token)
                    .send(user1Profile)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        res.should.have.status(201);
                        res.body.should.be.a("object");
                        res.body.should.have.property("profileInfo");
                        res.body.profileInfo.name.should.be.equal(user1Profile.displayname);
                        res.body.profileInfo.sex.should.be.equal("Other");
                        res.body.profileInfo.privacySetting.should.be.equal("public");
                        chai.request(server)
                            .post("/user/profile")
                            .set("Authorization", "Bearer " + user1Token)
                            .send(user1Profile)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                }
                                res.should.have.status(400);
                                done();
                            });
                    });
            });

    });

    it("Test profile update", (done) => {
        const newUser1Profile = {
            username: "test_username",
            displayname: "test_displayname2",
            sex: "Male",
        }

        const profileQueryById = {
            userId: user1Info.userId
        }

        const profileQueryByUsername = {
            username: user1Info.username
        }

        chai.request(server)
            .patch("/user/profile")
            .set("Authorization", "Bearer " + user1Token)
            .send(newUser1Profile)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property("profileInfo");
                res.body.profileInfo.name.should.be.equal(newUser1Profile.displayname);
                res.body.profileInfo.sex.should.be.equal("Male");
                res.body.profileInfo.privacySetting.should.be.equal("public");
                chai.request(server)
                    .get("/user/profile/search")
                    .set("Authorization", "Bearer " + user1Token)
                    .send(profileQueryById)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        res.body.should.have.property("profileInfo");
                        res.body.profileInfo.name.should.be.equal(newUser1Profile.displayname);
                        res.body.profileInfo.sex.should.be.equal("Male");
                        res.body.profileInfo.privacySetting.should.be.equal("public");
                        chai.request(server)
                            .get("/user/profile/search")
                            .set("Authorization", "Bearer " + user1Token)
                            .send(profileQueryByUsername)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                }
                                res.should.have.status(200);
                                res.body.should.be.a("object");
                                res.body.should.have.property("profileInfo");
                                res.body.profileInfo.name.should.be.equal(newUser1Profile.displayname);
                                res.body.profileInfo.sex.should.be.equal("Male");
                                res.body.profileInfo.privacySetting.should.be.equal("public");
                                chai.request(server)
                                    .get("/user/profile")
                                    .set("Authorization", "Bearer " + user1Token)
                                    .end((err, res) => {
                                        if (err) {
                                            return done(err);
                                        }
                                        res.should.have.status(200);
                                        res.body.should.be.a("object");
                                        res.body.should.have.property("profileInfo");
                                        res.body.profileInfo.name.should.be.equal(newUser1Profile.displayname);
                                        res.body.profileInfo.sex.should.be.equal("Male");
                                        res.body.profileInfo.privacySetting.should.be.equal("public");
                                        done();
                                    });
                            });
                    });
            });
    });

    it("Test profile picture updates", (done) => {
        const pictureQuery = {
            username: user1Info.username,
            userId: user1Info.userId,
            profilePictureUrl: "random.image.url"
        }
        chai.request(server)
            .post("/user/profile/upload-image")
            .set("Authorization", "Bearer " + user1Token)
            .send(pictureQuery)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.should.have.status(200);
                res.body.should.have.property("pictureURL");
                res.body.pictureURL.should.equal(pictureQuery.profilePictureUrl);
                done();
            });
    });

    it("Test profile privacy updates", (done) => {
        const privacyQuery = {
            username: user1Info.username,
            userId: user1Info.userId,
            privacySetting: "friends_only"
        }
        chai.request(server)
            .patch("/user/profile/set-privacy")
            .set("Authorization", "Bearer " + user1Token)
            .send(privacyQuery)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.should.have.status(200);
                res.body.should.have.property("privacySetting");
                res.body.privacySetting.should.equal(privacyQuery.privacySetting);
                done();
            });
    });

    it("Test profile deletion", (done) => {
        const deleteQuery = {
            username: user1Info.username,
            userId: user1Info.userId
        }

        chai.request(server)
            .delete("/user/profile")
            .set("Authorization", "Bearer " + user1Token)
            .send(deleteQuery)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.should.have.status(204);

                chai.request(server)
                    .get("/user/profile")
                    .set("Authorization", "Bearer " + user1Token)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        res.should.have.status(400);
                        done();
                    });
            });
    });


    after(async function () {
        if (process.env.NODE_ENV === "test") {
            await TestUtils.clearUserDatabase();
        }
        pool.end();
    });
});
