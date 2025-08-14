# Train Search Web Application 🚂

A train search application that finds routes between stations with pricing based on distance (₹1.25/km).

## 🌐 Live Demo
**[https://rapid-acceleration-hackathon-assignment.vercel.app/](https://rapid-acceleration-hackathon-assignment.vercel.app/)**

## 📊 Key Features Implemented
✅ Station dropdown selection  
✅ Direct train search  
✅ Connecting train routes  
✅ Distance-based pricing (₹1.25/km)  
✅ Price sorting  
✅ Responsive UI  
✅ 1000+ test trains

## 🛠 Tech Stack
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Deployment**: Vercel

## 🚀 Quick Setup

### Prerequisites
- Node.js (v14+)
- MongoDB
- Git

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/harshiniakshaya/Rapid-Acceleration-Hackathon-Assignment.git
cd Rapid-Acceleration-Hackathon-Assignment
```

2. **Backend Setup**
```bash
cd server
npm install
# Create .env file with:
# MONGODB_URI="PASTE HERE DB URL"
# PORT=5000
npm run dev
```

3. **Frontend Setup**
```bash
cd client
npm install
npm start
```

4. **Generate Test Data**
```bash
# In server directory
node scripts/generatetData.js
```

## 📁 Project Structure
```
├── client/          # React frontend
├── server/          # Express backend
│   ├── models/      # MongoDB schemas
│   ├── routes/      # API endpoints
│   ├── controllers/ # Business logic
│   └── config/      # Database config
└── README.md
```  

## 🎬 Demo Video
[https://www.youtube.com/watch?v=-i8nN0ZYKg8] - Live demonstration of all features

## 👨‍💻 Author
**Harshini Akshaya**  
GitHub: [@harshiniakshaya](https://github.com/harshiniakshaya)

**Gopinath**
GitHub: [@Gopi04-github](https://github.com/Gopi04-github)

---

