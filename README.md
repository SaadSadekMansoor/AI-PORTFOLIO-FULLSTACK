# AI Portfolio Website Builder

This project is a **full-stack AI-powered portfolio generator**.  
Users can describe their desired portfolio in natural language, and the system will generate a complete portfolio website.

---

## 📂 Project Structure

```
ai-portfolio-fullstack/
├── ai-portfolio-backend/   # Backend (Node.js + Express + TypeScript)
├── ai-portfolio-frontend/  # Frontend (React + Vite)
└── README.md               # Setup instructions
```

---

## ⚙️ Backend Setup (ai-portfolio-backend)

### 1. Install dependencies
```bash
cd ai-portfolio-backend
npm install
```

### 2. Configure environment variables
Create a `.env` file (copy from `.env.example`) and update values:
```
PORT=4000
GROQ_API_KEY=your_groq_api_key_here
GROQ_API_URL=https://api.groq.ai/v1/generate
REDIS_URL=redis://localhost:6379
STORAGE_TTL_SECONDS=3600
```

### 3. Start the backend
```bash
# Development mode
npm run dev

# Build + run production mode
npm run build
npm start
```

The backend runs on **http://localhost:4000**.  
Health check: [http://localhost:4000/health](http://localhost:4000/health)

---

## 💻 Frontend Setup (ai-portfolio-frontend)

### 1. Install dependencies
```bash
cd ai-portfolio-frontend
npm install
```

### 2. Start the frontend
```bash
npm run dev
```

The frontend runs on **http://localhost:3000**.  
It proxies API requests to the backend at `http://localhost:4000/api`.

---

## 🚀 Usage

1. Start both backend and frontend.  
2. Open **http://localhost:3000** in your browser.  
3. Enter a description of your portfolio (e.g., *"A modern personal portfolio with a dark theme, about me, projects, and contact form."*).  
4. The backend will use **Groq API** to generate HTML/CSS/JS, and the frontend will display it inside an iframe.

---

## 📌 Example API Requests

### Generate a portfolio
```http
POST http://localhost:4000/api/generate
Content-Type: application/json

{
  "prompt": "A minimalist portfolio with a white theme, a photo header, and project gallery."
}
```

### Retrieve a generated portfolio
```http
GET http://localhost:4000/api/retrieve/{id}
```

---

## ✅ Requirements

- Node.js (>= 18)
- npm or yarn
- (Optional) Redis for persistent storage (otherwise in-memory storage is used)

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, TypeScript, Redis (optional)
- **Frontend:** React, Vite, Axios
- **AI Model:** Groq API

---

Enjoy building your AI-powered portfolio generator! 🎉
