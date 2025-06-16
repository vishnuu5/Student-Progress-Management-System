const cron = require('node-cron');
const Student = require('../models/Student');
const Settings = require('../models/Settings');
const { fetchCodeforcesData } = require('./codeforcesService');
const { sendReminderEmail } = require('./emailService');

let syncJob = null;

const initializeCronJobs = async () => {
  try {
    // Get settings from database or create default settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        syncTime: '02:00', // Default to 2 AM
        syncFrequency: 'daily'
      });
    }

    // Ensure syncTime is in the correct format
    if (!settings.syncTime || !settings.syncTime.includes(':')) {
      settings.syncTime = '02:00';
      await settings.save();
    }

    // Schedule the sync job
    scheduleSyncJob(settings.syncTime, settings.syncFrequency);

    // Schedule inactivity check (runs after sync)
    cron.schedule('0 3 * * *', async () => {
      await checkInactiveStudents();
    });

    console.log('Cron jobs initialized successfully');
  } catch (error) {
    console.error('Error initializing cron jobs:', error);
    throw error;
  }
};

const scheduleSyncJob = (time, frequency) => {
  if (syncJob) {
    syncJob.stop();
  }

  // Ensure time is in the correct format
  if (!time || !time.includes(':')) {
    time = '02:00';
  }

  const [hours, minutes] = time.split(':');
  let cronExpression;

  switch (frequency) {
    case 'daily':
      cronExpression = `${minutes} ${hours} * * *`;
      break;
    case 'weekly':
      cronExpression = `${minutes} ${hours} * * 0`;
      break;
    case 'monthly':
      cronExpression = `${minutes} ${hours} 1 * *`;
      break;
    default:
      cronExpression = `${minutes} ${hours} * * *`;
  }

  syncJob = cron.schedule(cronExpression, async () => {
    try {
      console.log('Running scheduled sync job...');
      const students = await Student.find({ isActive: true });
      
      for (const student of students) {
        try {
          const cfData = await fetchCodeforcesData(student.codeforcesHandle);
          
          // Update student data
          student.currentRating = cfData.currentRating;
          student.maxRating = cfData.maxRating;
          student.lastDataUpdate = new Date();
          student.lastSubmissionDate = cfData.lastSubmissionDate;
          
          await student.save();
          console.log(`Updated data for student: ${student.name}`);
        } catch (error) {
          console.error(`Error updating student ${student.name}:`, error);
        }
      }
      console.log('Sync job completed successfully');
    } catch (error) {
      console.error('Error in sync job:', error);
    }
  });

  console.log(`Sync job scheduled for ${time} ${frequency}`);
};

const checkInactiveStudents = async () => {
  try {
    console.log('Checking for inactive students...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const inactiveStudents = await Student.find({
      lastSubmissionDate: { $lt: sevenDaysAgo },
      emailRemindersEnabled: true,
      isActive: true
    });

    console.log(`Found ${inactiveStudents.length} inactive students`);

    for (const student of inactiveStudents) {
      try {
        await sendReminderEmail(student.email, student.name);
        student.emailRemindersCount += 1;
        await student.save();
        console.log(`Sent reminder email to ${student.name}`);
      } catch (error) {
        console.error(`Error sending reminder to ${student.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking inactive students:', error);
  }
};

const updateSyncSettings = async (time, frequency) => {
  try {
    const settings = await Settings.findOne() || new Settings();
    settings.syncTime = time;
    settings.syncFrequency = frequency;
    await settings.save();

    scheduleSyncJob(time, frequency);
    console.log('Sync settings updated successfully');
  } catch (error) {
    console.error('Error updating sync settings:', error);
    throw error;
  }
};

module.exports = {
  initializeCronJobs,
  updateSyncSettings
}; 