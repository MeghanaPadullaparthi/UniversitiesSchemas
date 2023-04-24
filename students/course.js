const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

const collectionName = 'courses';

// Course schema validation
const courseSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['courseName', 'courseId', 'courseDesc', 'instructorName'],
    properties: {
      courseName: {
        bsonType: 'string',
        description: 'must be a string and is required',
      },
      courseId: {
        bsonType: 'string',
        description: 'must be a string and is required',
      },
      courseDesc: {
        bsonType: 'string',
        description: 'must be a string and is required',
      },
      instructorName: {
        bsonType: 'string',
        description: 'must be a string and is required',
      },
    },
  },
};

// Create a new course
async function createCourse(course) {
  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection(collectionName);

    const result = await collection.insertOne(course, { validate: true, validationLevel: 'strict', validationAction: 'error', validationRules: courseSchema });
    console.log(`${result.insertedCount} course(s) was/were inserted.`);
  } catch (err) {
    console.error(`Failed to insert course: ${err}`);
  } finally {
    await client.close();
  }
}

// Get all courses
async function getCourses() {
  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection(collectionName);

    const courses = await collection.find().toArray();
    return courses;
  } catch (err) {
    console.error(`Failed to get courses: ${err}`);
    return [];
  } finally {
    await client.close();
  }
}

module.exports = {
  courseSchema,
  createCourse,
  getCourses,
};
