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
            course_title: resu.course_title, course_code: resu.course_code,
            course_credit: resu.course_credit, course_semester: resu.course_semester,
            lecturers: [],
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
                            const newCourse = []

                            // Check if the student is already in the students array of any course
                            courses.forEach((course) => {
                                const isStudentRegistered = course.students.some((student) => {
                                    return student.matric_number === studentInfo.matric_number; // Check based on a unique identifier, like name
                                });

                                if (isStudentRegistered) {

                                    // Add course code and course ID to the user's course array
                                    newCourse.push({ code: course.code, id: course._id });
                                } else {
                                    course.students.push(studentInfo); // Add the student to the course if not already registered

                                    // Add course code and course ID to the user's course array
                                    newCourse.push({ code: course.course_code, id: course._id });
                                }
                            });

                            updatedUser.courses = newCourse
                            // Save the updated courses and user
                            const savePromises = [...courses.map((course) => course.save()), updatedUser.save()];

                            Promise.all(savePromises)
                                .then(() => {
                                    // Send a success response
                                    res.status(200).send({ "message": "User and courses updated successfully", "user": updatedUser });
                                })
                                .catch((err) => {
                                    // Handle the error if the update fails
                                    console.error(err);
                                    res.status(500).send("Failed to update courses");
                                });

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
                            const newCourse = []

                            // Check if the student is already in the students array of any course
                            courses.forEach((course) => {
                                const isStudentRegistered = course.lecturers.some((student) => {
                                    return student.staff_id === studentInfo.staff_id; // Check based on a unique identifier, like name
                                });

                                if (isStudentRegistered) {
                                    // Add course code and course ID to the user's course array
                                    newCourse.push({ code: course.course_code, id: course._id });
                                    console.log("registered")
                                } else {
                                    course.lecturers.push(studentInfo); // Add the student to the course if not already registered

                                    // Add course code and course ID to the user's course array
                                    newCourse.push({ code: course.course_code, id: course._id });
                                }
                            });

                            updatedUser.courses = newCourse
                            // Save the updated courses and user
                            const savePromises = [...courses.map((course) => course.save()), updatedUser.save()];

                            Promise.all(savePromises)
                                .then(() => {
                                    // Send a success response
                                    res.status(200).send({ "message": "User and courses updated successfully", "user": updatedUser });
                                })
                                .catch((err) => {
                                    // Handle the error if the update fails
                                    console.error(err);
                                    res.status(500).send("Failed to update courses");
                                });

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




router.delete('/remove-course/:userId/:courseId', async (req, res) => {
    const userId = req.params.userId;
    const courseId = req.params.courseId;

    console.log(userId, courseId)

    try {
        // Find the user by their ID
        const user = await User.findOne({ identity_number: userId });

        console.log(user)

        if (!user) {
            // Handle the case when the user is not found
            res.status(404).send("User not found");
            return;
        }


        // Find the course by its ID
        const course = await Course.findOne({ course_code: courseId });

        if (!course) {
            // Handle the case when the course is not found
            res.status(404).send("Course not found");
            return;
        }

        if (user.courses) {
            console.log("heree")
            //  Remove the course from the user's courses array
            user.courses = user.courses.filter(courseObj =>
                courseObj.code !== courseId

            );

        }

        if (user.role === "teacher") {
            // Remove the user from the course's students array
            course.lecturers = course.lecturers.filter(student => student.staff_id !== userId);
        }

        if (user.role === "student") {
            // Remove the user from the course's students array
            course.students = course.students.filter(student => student.matric_number !== userId);
        }

        // Save the updated user and course        

        if (user && course) {
            console.log("gotten here")
            await Promise.all([course.save(), user.save()]);
        }


        // Send a success response
        res.status(200).send({ "message": "Course and user details removed successfully", "user": user, "course": course });
    } catch (err) {
        // Handle any errors that occur during the process
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});









module.exports = router