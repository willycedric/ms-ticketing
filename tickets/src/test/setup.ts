import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(email: string): string[];
    }
  }
}
jest.mock('../nats-wrapper');
let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdsdfds';
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.getAuthCookie = (email: string) => {
  //Build a jwt payload  {id, email }
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email,
  };
  //create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  //Build session Object. {jwt: MY_JWT}
  const session = { jwt: token };
  //Tun that session into JSON
  const sessionJSON = JSON.stringify(session);
  //Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  //return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`];
};
