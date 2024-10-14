const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));

const sheetId = process.env.GOOGLE_SHEET_ID;
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

const auth = new google.auth.JWT(
  clientEmail,
  null,
  privateKey,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

// Append data to Google Sheets
async function appendTradeData(tradeData) {
  const request = {
    spreadsheetId: sheetId,
    range: 'Sheet1!A:F', 
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [tradeData],
    },
  };

  try {
    const response = await sheets.spreadsheets.values.append(request);
    console.log(`${response.data.updates.updatedCells} cells appended.`);
  } catch (err) {
    console.error('Error appending data to sheet:', err);
  }
}


app.post('/send_trade', async (req, res) => {
  const { buyorsell, amount, crypto, wallet, email } = req.body;
  console.log(req.body);

  
  const date = new Date().toLocaleString(); 

  
  await appendTradeData([buyorsell, amount, crypto, wallet, email, date]);

  
  res.json({ message: 'Trade details saved and sent succesfull you will receive an email shortly.' });
});

app.listen(4000,() => {
  console.log('Server started on port 4000');
});
