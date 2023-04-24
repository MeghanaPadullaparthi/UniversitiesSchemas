require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = process.env.MONGODB_URI;

// Import the functions from course.js and grades.js
const { courseSchema, createCourse, getCourses } = require('./students/course.js');
const { gradeSchema, createGrade, getGrades } = require('./students/grade.js');




async function setupDatabase() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();

        // Create the students collection with schema validation
        const studentScheme = {
            $jsonSchema: {
                bsonType: 'object',
                required: ['name', 'studentId', 'email', 'major', 'classYear'],
                properties: {
                    name: {
                        bsonType: 'string',
                    },
                    studentId: {
                        bsonType: 'string',
                        pattern: '^[0-9a-fA-F]{24}$',
                    },
                    email: {
                        bsonType: 'string',
                        description: 'must be a unique string',
                        pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
                    },
                    major: {
                        bsonType: 'string',
                    },
                    classYear: {
                        bsonType: 'number',
                    },
                },
                additionalProperties: false,
            },

        };


        // Create the courses collection and create an index on the courseId field
        await client.db().createCollection('courses');
        await client.db().collection('courses').createIndex({ courseId: 1 });

        // Create the grades collection and create an index on the studentId field
        await client.db().createCollection('grades');
        await client.db().collection('grades').createIndex({ studentId: 1 });

        // Insert sample data into the collections from data.json file
        const dataPath = path.join(__dirname, 'data.json');
        const data = JSON.parse(fs.readFileSync(dataPath));

        if (!Array.isArray(data.students) || !Array.isArray(data.courses) || !Array.isArray(data.grades)) {
            console.error('Invalid data format in data.json');
            return;
        }


        // Insert courses into the courses collection
        const courses = data.courses;
        const courseCollection = client.db().collection('courses');
        for (const course of courses) {
            await createCourse(course);
        }

        // Insert grades into the grades collection
        const grades = data.grades;
        const gradeCollection = client.db().collection('grades');
        for (const grade of grades) {
            await createGrade(grade);
        }

        // Insert students into the students collection
        const students = data.students;
        try {
            await client.connect();
            const database = client.db();
            const collection = database.collection('students');
            for (const student of students) {
                const result = await collection.insertOne(student, { validate: true, validationLevel: 'strict', validationAction: 'error', validationRules: studentScheme });
                console.log(`${result.insertedCount} students(s) was/were inserted.`);
            }
        } catch (err) {
            console.error(`Failed to insert grade: ${err}`);
        } finally {
            await client.close();
        }
        console.log('Sample data inserted successfully.');
    } catch (err) {
        console.error(`Failed to insert sample data: ${err}`);
    } finally {
        await client.close();
    }
}

// Use the getCourses and getGrades functions
async function main() {
    try {
        await setupDatabase();

        const courses = await getCourses();
        console.log('All courses:', courses);

        const grades = await getGrades();
        console.log('All grades:', grades);
    } catch (err) {
        console.error(`Error: ${err}`);
    }
}

try {
    setupDatabase();
} catch (error) {
    console.error('Error setting up database:', error);
}
