const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server'); // path to your server.js file
const should = chai.should();
const Room = require('../models/Room'); // path to your Room model
const TestUtils = require('./test_utils'); // path to your test_utils.js file

chai.use(chaiHttp);

describe('Unit test for room management', function() {
    // Empty the database before each test to start from a clean state
    beforeEach(async () => {
        try {
            if (!await TestUtils.initializeTest()) {
                throw new Error('Failed to initialize test');
            }

        } catch (err) {
            console.error("connection error", err.stack);
        }
    });

    describe('Test room creation', function() {
        let userToken = '';



        it('should create a room', function(done) {
            let room = {
                name: 'Test room',
                tags: ['test1', 'test2'],
                isPrivate: false,
                creator: 'testCreatorId',
                participants: ['testParticipantId1', 'testParticipantId2']
            };

            chai.request(server)
                .post('/room') // Replace with your endpoint for creating rooms
                .send(room)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('name').eql(room.name);
                    done();
                });
        });
    });

    describe('/GET Room', function() {
        it('should get a room by ID', function(done) {
            let room = new Room({
                name: 'Test room',
                tags: ['test1', 'test2'],
                isPrivate: false,
                creator: 'testCreatorId',
                participants: ['testParticipantId1', 'testParticipantId2']
            });

            room.save(function(err, room) {
                chai.request(server)
                    .get('/room/' + room.id) // Replace with your endpoint for retrieving rooms
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('_id').eql(room.id);
                        done();
                    });
            });
        });
    });

    describe('/PUT Room', function() {
        it('should add a user to a room', function(done) {
            let room = new Room({
                name: 'Test room',
                tags: ['test1', 'test2'],
                isPrivate: false,
                creator: 'testCreatorId',
                participants: ['testParticipantId1', 'testParticipantId2']
            });

            room.save(function(err, room) {
                chai.request(server)
                    .put('/room/' + room.id) // Replace with your endpoint for updating rooms
                    .send({participants: ['testParticipantId3']}) // Add a new participant
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('participants').include('testParticipantId3');
                        done();
                    });
            });
        });
    });

    describe('/DELETE Room', function() {
        it('should delete a room by ID', function(done) {
            let room = new Room({
                name: 'Test room',
                tags: ['test1', 'test2'],
                isPrivate: false,
                creator: 'testCreatorId',
                participants: ['testParticipantId1', 'testParticipantId2']
            });

            room.save(function(err, room) {
                chai.request(server)
                    .delete('/room/' + room.id) // Replace with your endpoint for deleting rooms
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Room successfully deleted');
                        done();
                    });
            });
        });
    });
});
