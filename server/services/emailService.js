const nodemailer = require("nodemailer");
const Student = require("../models/Student");
const Settings = require("../models/Settings");

async function createTransporter() {
  const settings = await Settings.findOne();

  if (!settings || !settings.emailSettings.smtpHost) {
    throw new Error("Email settings not configured");
  }

  return nodemailer.createTransporter({
    host: settings.emailSettings.smtpHost,
    port: settings.emailSettings.smtpPort,
    secure: settings.emailSettings.smtpPort === 465,
    auth: {
      user: settings.emailSettings.smtpUser,
      pass: settings.emailSettings.smtpPassword,
    },
  });
}

async function sendReminderEmail(student) {
  try {
    const transporter = await createTransporter();
    const settings = await Settings.findOne();

    const mailOptions = {
      from: settings.emailSettings.fromEmail,
      to: student.email,
      subject: "Reminder: Get Back to Problem Solving!",
      html: `
        <h2>Hi ${student.name}!</h2>
        <p>We noticed you haven't made any submissions on Codeforces in the last 7 days.</p>
        <p>Keep up your coding practice and continue solving problems to improve your skills!</p>
        <p>Your current rating: <strong>${student.currentRating}</strong></p>
        <p>Your max rating: <strong>${student.maxRating}</strong></p>
        <p>Happy coding!</p>
        <br>
        <p><em>Student Progress Management System</em></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${student.email}`);

    // Update reminder count
    student.emailRemindersCount += 1;
    await student.save();
  } catch (error) {
    console.error(`Error sending email to ${student.email}:`, error.message);
  }
}

async function checkInactiveStudents() {
  try {
    const settings = await Settings.findOne();
    const thresholdDays = settings?.inactivityThreshold || 7;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

    const inactiveStudents = await Student.find({
      isActive: true,
      emailRemindersEnabled: true,
      $or: [
        { lastSubmissionDate: { $lt: thresholdDate } },
        { lastSubmissionDate: null },
      ],
    });

    console.log(`Found ${inactiveStudents.length} inactive students`);

    for (const student of inactiveStudents) {
      await sendReminderEmail(student);
    }
  } catch (error) {
    console.error("Error checking inactive students:", error);
  }
}

module.exports = {
  sendReminderEmail,
  checkInactiveStudents,
};
