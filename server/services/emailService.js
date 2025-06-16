const nodemailer = require("nodemailer");
const Student = require("../models/Student");
const Settings = require("../models/Settings");

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendReminderEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Time to Get Back to Problem Solving!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Hey ${name}!</h2>
        <p>We noticed you haven't been active on Codeforces for the past 7 days. Remember, consistent practice is key to improving your competitive programming skills!</p>
        <p>Why not solve a few problems today? Here are some benefits of regular practice:</p>
        <ul>
          <li>Improve your problem-solving skills</li>
          <li>Learn new algorithms and techniques</li>
          <li>Build your confidence in competitive programming</li>
          <li>Stay prepared for upcoming contests</li>
        </ul>
        <p>Keep up the great work and happy coding!</p>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 0.875rem;">
            This is an automated reminder. If you wish to disable these reminders, you can do so from your profile settings.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${email}`);
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
};

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
      await sendReminderEmail(student.email, student.name);
    }
  } catch (error) {
    console.error("Error checking inactive students:", error);
  }
}

module.exports = {
  sendReminderEmail,
  checkInactiveStudents,
};
