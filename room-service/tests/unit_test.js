const chai = require('chai');
const chaiHttp = require('chai-http');

process.env.NODE_ENV === 'test' ? require('dotenv').config({ path: '.env.test' }) : require('dotenv').config();

const userSever = process.env.USER_SERVER;
const roomServer = process.env.ROOM_SERVER;

const should = chai.should();
const Room = require('../src/models/Room'); // path to your Room model
const TestUtils = require('./test_utils'); // path to your test_utils.js file

chai.use(chaiHttp);

describe('Unit test for room management', function () {
    // Empty the database before each test to start from a clean state
    before(async function () {
        try {
            this.timeout(10000);
            if (!await TestUtils.initializeTest()) {
                throw new Error('Failed to initialize test');
            }
            console.log('Test initialized');
        } catch (err) {
            console.error("connection error", err.stack);
        }
    });

    let userToken = '';
    let roomId = '';
    let roomToken = '';

    it('should register a user', function (done) {
        let userInfo = {
            username: 'testUser',
            password: 'testPassword',
            email: "test_email@test.com",
            adminStatus: true,
        }

        chai.request(userSever).
            post('/auth/register').
            send(userInfo).
            end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.should.have.status(201);
                res.body.should.be.a("object");
                res.body.should.have.property("accessToken");
                res.body.should.have.property("userInfo");
                res.body.userInfo.username.should.be.equal(userInfo.username);
                res.body.userInfo.email.should.be.equal(userInfo.email);
                res.body.userInfo.adminStatus.should.be.equal(true);
                userToken = res.body.accessToken;
                done();
            });
    });


    it('should create a room', function (done) {
        let room = {
            roomInfo: {
                name: 'Test room',
                tags: ['test1', 'test2'],
                isPrivate: false
            }
        };

        chai.request(roomServer)
            .post('/') // Replace with your endpoint for creating rooms
            .send(room)
            .set('Authorization', 'Bearer ' + userToken)
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('name');
                res.body.name.should.be.equal(room.roomInfo.name);
                res.body.should.have.property('roomId');
                roomId = res.body.roomId;
                res.body.should.have.property('roomToken');
                roomToken = res.body.roomToken;
                done();
            });
    });

    it('should get a room by ID', function (done) {
        chai.request(roomServer)
            .get('/' + roomId) // Replace with your endpoint for retrieving rooms
            .set('Authorization', 'Bearer ' + userToken)
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.roomInfo.name.should.be.equal('Test room');
                res.body.should.have.property('roomId').equal(roomId);
                done();
            });
    });

    it('should not get a room by non-existing ID', function (done) {
        const bogusRoomId = 'bogusRoomId';
        chai.request(roomServer)
            .get('/' + bogusRoomId) // Replace with your endpoint for retrieving rooms
            .set('Authorization', 'Bearer ' + userToken)
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                res.should.have.status(404);
                done();
            });
    });

    it('should have a new user join and leave the room', function (done) {
        let userInfo = {
            username: 'testUser2',
            password: 'testPassword',
            email: "test_email2@email.com",
        }

        let userToken2 = '';
        let roomToken2 = '';

        chai.request(userSever).
            post('/auth/register').
            send(userInfo).
            end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.should.have.status(201);
                res.body.should.be.a("object");
                res.body.should.have.property("accessToken");
                res.body.should.have.property("userInfo");
                res.body.userInfo.username.should.be.equal(userInfo.username);
                res.body.userInfo.email.should.be.equal(userInfo.email);
                res.body.userInfo.adminStatus.should.be.equal(false);
                userToken2 = res.body.accessToken;
                chai.request(roomServer).
                    post(`/${roomId}/join`).
                    set('Authorization', 'Bearer ' + userToken2).
                    end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        res.body.should.have.property("roomToken");
                        roomToken2 = res.body.roomToken;
                        // Do more tests using the room token
                        
                        chai.request(roomServer).
                            put(`/${roomId}/leave`).
                            set('Authorization', 'Bearer ' + userToken2).
                            end(function (err, res) {
                                if (err) {
                                    return done(err);
                                }
                                res.should.have.status(200);
                                res.body.should.be.a("object");

                                done();
                            });
                    });
            });
    });

    it('should delete a room by ID', function (done) {
        chai.request(roomServer)
            .delete(`/${roomId}`)
            .set('Authorization', 'Bearer ' + userToken)
            .end(function (err, res) {
                res.should.have.status(204);
                res.body.should.be.a('object');
                done();
            });
    });
});
