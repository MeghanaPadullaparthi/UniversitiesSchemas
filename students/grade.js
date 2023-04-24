const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

const collectionName = 'grades';

// Grade schema validation
const gradeSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['studentId', 'courseId', 'grade'],
    properties: {
      studentId: {
        bsonType: 'string',
        description: 'must be a string and is required',
      },
      courseId: {
        bsonType: 'string',
        description: 'must be a string and is required',
      },
      grade: {
        bsonType: 'int',
        minimum: 0,
        maximum: 100,
        description: 'must be an integer between 0 and 100',
      },
    },
  },
};

// Create a new grade
async function createGrade(grade) {
  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection(collectionName);

    const result = await collection.insertOne(grade, { validate: true, validationLevel: 'strict', validationAction: 'error', validationRules: gradeSchema });
    console.log(`${result.insertedCount} grade(s) was/were inserted.`);
  } catch (err) {
    console.error(`Failed to insert grade: ${err}`);
  } finally {
    await client.close();
  }
}

// Get all grades
async function getGrades() {
  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection(collectionName);

    const grades = await collection.find().toArray();
    return grades;
  } catch (err) {
    console.error(`Failed to get grades: ${err}`);
    return [];
  } finally {
    await client.close();
  }
}

module.exports = {
  gradeSchema,
  createGrade,
  getGrades,
};
