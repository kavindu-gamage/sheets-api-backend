require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 4000;

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's URL
}));

const credentials = require('./config/google-service-account.json'); 

app.use(bodyParser.json());

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });


const SPREADSHEET_ID = process.env.SHEET_ID;

app.post('/api/google-sheet', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Append data to Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:C', 
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[name, email, message, new Date().toISOString()]],
      },
    });

    res.status(200).send('Data added to Google Sheet successfully.');
  } catch (error) {
    console.error('Error adding data to Google Sheet:', error);
    res.status(500).send('Failed to add data to Google Sheet');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
