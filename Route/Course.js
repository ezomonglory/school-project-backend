const express = require("express")
const router = express.Router()
const createError = require('http-errors')
const Course = require("../Model/Course")
const User = require("../Model/User")

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


router.get("/:course_id", async (req, res, next) => {
    try {
        const course_id = req.params
        const result = await Course.find({ _id: course_id.course_id })

        res.send(result)
    } catch (err) {
        next(err)
    }
})


router.post("/add-course", async (req, res, next) => {
    try {
        // const result = req.body;


        // if (result.role === "student") {
        //     const studentInfo = {
        //         name: result.full_name, // Replace with the actual student name
        //         matric_number: result.identity_number,
        //     };

        //     const courseIds = result.courses.map((course) => course.id);

        //     // Assuming you have a User model
        //     User.findOneAndUpdate(
        //         { _id: result.userId }, // Assuming userId is available in the request
        //         { $set: studentInfo },
        //         { new: true }
        //     )
        //         .then((updatedUser) => {
        //             if (!updatedUser) {
        //                 // Handle the case when the user is not found
        //                 res.status(404).send("User not found");
        //                 return;
        //             }


        //             const alreadyRegisteredCourses = [];

        //             // Check if the student is already in the students array of any course
        //             courses.forEach(async (course) => {
        //                 const isStudentRegistered = course.students.some((student) => {
        //                     return student.matric_number === studentInfo.matric_number; // Check based on a unique identifier, like name
        //                 });

        //                 if (isStudentRegistered) {
        //                     alreadyRegisteredCourses.push(course.course_code); // Store the course name in which the student is already registered
        //                 } else {
        //                     const user = await User.find({ identity_number: result.identity_number })


        //                     course.students.push(studentInfo); // Add the student to the course if not already registered
        //                 }
        //             });

        //             if (alreadyRegisteredCourses.length > 0) {
        //                 // Handle the case when the student is already registered in some courses
        //                 res.status(400).send(`Student is already registered in courses: ${alreadyRegisteredCourses.join(', ')}`);
        //             } else {
        //                 // Save the updated courses
        //                 Promise.all(courses.map((course) => course.save()))
        //                     .then(() => {
        //                         // Send a success response
        //                         res.status(200).send("Courses updated successfully");
        //                     })
        //                     .catch((err) => {
        //                         // Handle the error if the update fails
        //                         console.error(err);
        //                         res.status(500).send("Failed to update courses");
        //                     });
        //             }
        //         })
        //         .catch((err) => {
        //             // Handle the error
        //             console.error(err);
        //             res.status(500).send("Internal Server Error");
        //         });
        // }

        const result = req.body;

        if (result.role === "student") {
            const studentInfo = {
                        name: result.full_name, // Replace with the actual student name
                        matric_number: result.identity_number,
                    };

            const courseIds = result.courses.map((course) => course.id);

            // Assuming you have a User model
            User.findOneAndUpdate(
                { identity_number: result.identity_number }, // Assuming userId is available in the request
                { $set: studentInfo },
                { new: true }
            )
                .then((updatedUser) => {
                    if (!updatedUser) {
                        // Handle the case when the user is not found
                        res.status(404).send("User not found");
                        return;
                    }

                    // Now that the user details are updated, proceed to update the courses

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
                                    return student.name === studentInfo.name; // Check based on a unique identifier, like name
                                });

                                if (isStudentRegistered) {
                                    alreadyRegisteredCourses.push(course.name); // Store the course name in which the student is already registered
                                } else {
                                    course.students.push(studentInfo); // Add the student to the course if not already registered

                                    // Add course code and course ID to the user's course array
                                    updatedUser.courses.push({ code: course.code, id: course._id });
                                }
                            });

                            if (alreadyRegisteredCourses.length > 0) {
                                // Handle the case when the student is already registered in some courses
                                res.status(400).send(`Student is already registered in courses: ${alreadyRegisteredCourses.join(', ')}`);
                            } else {
                                // Save the updated courses and user
                                const savePromises = [...courses.map((course) => course.save()), updatedUser.save()];

                                Promise.all(savePromises)
                                    .then(() => {
                                        // Send a success response
                                        res.status(200).send("User and courses updated successfully");
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
                })
                .catch((err) => {
                    // Handle the error
                    console.error(err);
                    res.status(500).send("Internal Server Error");
                });
        }

        if (result.role === "teacher") {
            const studentInfo = {
                name: result.full_name, // Replace with the actual student name
                staff_id: result.identity_number,


            };

            const courseIds = result.courses.map((course) => course.id);

            // Assuming you have a User model
            User.findOneAndUpdate(
                { identity_number: result.identity_number }, // Assuming userId is available in the request
                { $set: studentInfo },
                { new: true }
            )
                .then((updatedUser) => {
                    if (!updatedUser) {
                        // Handle the case when the user is not found
                        res.status(404).send("User not found");
                        return;
                    }

                    // Now that the user details are updated, proceed to update the courses

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
                                    return student.name === studentInfo.name; // Check based on a unique identifier, like name
                                });

                                if (isStudentRegistered) {
                                    alreadyRegisteredCourses.push(course.name); // Store the course name in which the student is already registered
                                } else {
                                    course.students.push(studentInfo); // Add the student to the course if not already registered

                                    // Add course code and course ID to the user's course array
                                    updatedUser.courses.push({ code: course.course_code, id: course._id });
                                }
                            });

                            if (alreadyRegisteredCourses.length > 0) {
                                // Handle the case when the student is already registered in some courses
                                res.status(400).send(`Teacher is already registered in courses: ${alreadyRegisteredCourses.join(', ')}`);
                            } else {
                                // Save the updated courses and user
                                const savePromises = [...courses.map((course) => course.save()), updatedUser.save()];

                                Promise.all(savePromises)
                                    .then(() => {
                                        // Send a success response
                                        res.status(200).send("User and courses updated successfully");
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
                })
                .catch((err) => {
                    // Handle the error
                    console.error(err);
                    res.status(500).send("Internal Server Error");
                });
        }
    } catch (err) {
        next(err)
    }
})













module.exports = router