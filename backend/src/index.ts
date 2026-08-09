import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend a correr em http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
