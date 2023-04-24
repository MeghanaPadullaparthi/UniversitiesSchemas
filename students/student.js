const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });

const collectionName = 'students';



async function getStudents() {
  try {
    await client.connect();
    const students = await client
      .db()
      .collection('students')
      .find()
      .toArray();
    return students;
  } catch (error) {
    console.error('Error getting students:', error);
  } finally {
    await client.close();
  }
}

async function getStudentById(id) {
  try {
    if (!id) throw new Error('Student ID is required.');
    await client.connect();
    const student = await client
      .db()
      .collection('students')
      .findOne({ _id: ObjectId(id) });
    return student;
  } catch (error) {
    console.error('Error getting student by ID:', error);
  } finally {
    await client.close();
  }
}


async function updateStudent(id, update) {
  try {
    if (!id) throw new Error('Student ID is required.');
    if (!update) throw new Error('Update data is required.');
    await client.connect();
    const result = await client
      .db()
      .collection('students')
      .updateOne({ _id: ObjectId(id) }, { $set: update });
    console.log('Updated student with ID:', id);
    return result.modifiedCount;
  } catch (error) {
    console.error('Error updating student:', error);
  } finally {
    await client.close();
  }
}

async function deleteStudent(id) {
  try {
    if (!id) throw new Error('Student ID is required.');
    await client.connect();
    const result = await client
      .db()
      .collection('students')
      .deleteOne({ _id: ObjectId(id) });
    console.log('Deleted student with ID:', id);
    return result.deletedCount;
  } catch (error) {
    console.error('Error deleting student:', error);
  } finally {
    await client.close();
  }
}

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
};
