require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const cors = require('cors');

// Decode the base64-encoded JSON content
const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8'));

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware and route setup
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // CORS with frontend URL
}));

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
