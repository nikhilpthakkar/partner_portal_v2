import axios from 'axios';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const URL = 'https://partner-portal.ackodev.com';

const app = express();

/**
 * Only use cookie + cors.
 * DO NOT use express.json() or urlencoded()
 * They break multipart/form-data streaming.
 */
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  }),
);

/**
 * Universal proxy handler
 */
app.all('*', async (req, res) => {
  try {

    // Forward original headers
    const headers = {
      ...req.headers,
      'x-auth-user-id': process.env.LOCAL_PROXY_USER_ID || 'your.user@example.com',
    };

    // Remove host header (important)
    delete headers.host;

    const response = await axios({
      method: req.method,
      url: `${URL}${req.url}`,
      headers,
      data: req, // 🔥 forward raw request stream
      responseType: 'stream', // 🔥 support file download
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: () => true, // allow non-200 responses
    });

    // Forward status
    res.status(response.status);

    // Forward response headers
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Pipe response back to client
    response.data.pipe(res);
  } catch (error) {
    console.error('❌ Proxy Error:', error.message);

    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Internal Proxy Error' };

    res.status(status).json(data);
  }
});

app.listen(9001, () => {
  console.log('🚀 Proxy server running on http://localhost:9001');
});
