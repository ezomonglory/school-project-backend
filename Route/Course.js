const express = require("express")
const router = express.Router()
const createError = require('http-errors')
const Course = require("../Model/Course")

router.post("/create", async (req, res, next) => {
    try {
        const resu = req.body


        // if (!resu.email || !resu.password) throw createError.BadRequest()

        const result = await Course.findOne({ course_code: resu.course_code })

        if (result) {
            throw createError.Conflict(`${resu.course_code} is already been registered`)
        }

        const user = new Course({
            course_title: resu.course_title, course_code: resu.course_code, lecturers: [],
            students: []
        })
        const savedUser = await user.save()


        res.send(savedUser)
    } catch (error) {
        next(error)
    }
})


router.get("/all-courses", async (req, res, next) => {
    try {
        const result = await Course.find()

        res.send(result)
    } catch (err) {
        next(err)
    }
})


router.get("/:course_id", async (req, res, next)=> {
    try {
        const course_id = req.params
        const result = await Course.find({_id: course_id.course_id})

        res.send(result)
    } catch (err) {
        next(err)
    }
})


router.post("/add-course", async (req, res, next) => {
    try {
        const result = req.body;


        if (result.role === "Student") {
            const studentInfo = {
                name: result.full_name, // Replace with the actual student name
                matric_number: result.identity_number,
            };

            const courseIds = result.courses.map((course) => course.id);

            // Assuming you have a Course model
            Course.find({ _id: { $in: courseIds } })
                .then((courses) => {
                    if (!courses || courses.length === 0) {
                        // Handle the case when no courses are found
                        res.status(404).send("No courses found");
                        return;
                    }

                    const alreadyRegisteredCourses = [];

                    // Check if the student is already in the students array of any course
                    courses.forEach((course) => {
                        const isStudentRegistered = course.students.some((student) => {
                            return student.matric_number === studentInfo.matric_number; // Check based on a unique identifier, like name
                        });

                        if (isStudentRegistered) {
                            alreadyRegisteredCourses.push(course.course_code); // Store the course name in which the student is already registered
                        } else {
                            course.students.push(studentInfo); // Add the student to the course if not already registered
                        }
                    });

                    if (alreadyRegisteredCourses.length > 0) {
                        // Handle the case when the student is already registered in some courses
                        res.status(400).send(`Student is already registered in courses: ${alreadyRegisteredCourses.join(', ')}`);
                    } else {
                        // Save the updated courses
                        Promise.all(courses.map((course) => course.save()))
                            .then(() => {
                                // Send a success response
                                res.status(200).send("Courses updated successfully");
                            })
                            .catch((err) => {
                                // Handle the error if the update fails
                                console.error(err);
                                res.status(500).send("Failed to update courses");
                            });
                    }
                })
                .catch((err) => {
                    // Handle the error
                    console.error(err);
                    res.status(500).send("Internal Server Error");
                });
        }


        if (result.role === "Teacher") {
            const studentInfo = {
                name: result.full_name, // Replace with the actual student name
                staff_id: result.identity_number,
            };

            const courseIds = result.courses.map((course) => course.id);

            // Assuming you have a Course model
            Course.find({ _id: { $in: courseIds } })
                .then((courses) => {
                    if (!courses || courses.length === 0) {
                        // Handle the case when no courses are found
                        res.status(404).send("No courses found");
                        return;
                    }

                    const alreadyRegisteredCourses = [];

                    // Check if the student is already in the students array of any course
                    courses.forEach((course) => {
                        const isStudentRegistered = course.lecturers.some((student) => {
                            return student.staff_id === studentInfo.staff_id; // Check based on a unique identifier, like name
                        });

                        if (isStudentRegistered) {
                            alreadyRegisteredCourses.push(course.course_code); // Store the course name in which the student is already registered
                        } else {
                            course.lecturers.push(studentInfo); // Add the student to the course if not already registered
                        }
                    });

                    if (alreadyRegisteredCourses.length > 0) {
                        // Handle the case when the student is already registered in some courses
                        res.status(400).send(`Teacher is already registered in courses: ${alreadyRegisteredCourses.join(', ')}`);
                    } else {
                        // Save the updated courses
                        Promise.all(courses.map((course) => course.save()))
                            .then(() => {
                                // Send a success response
                                res.status(200).send("Courses updated successfully");
                            })
                            .catch((err) => {
                                // Handle the error if the update fails
                                console.error(err);
                                res.status(500).send("Failed to update courses");
                            });
                    }
                })
        }
    } catch (err) {
        next(err)
    }
})













module.exports = router