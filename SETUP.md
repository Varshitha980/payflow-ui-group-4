# 🚀 Complete Setup Guide

## Quick Start (Recommended)

### For Windows Users:
1. **Double-click** `start-servers.bat` file
2. Wait for both servers to start
3. Open your browser to `http://localhost:3000`

### For Mac/Linux Users:
1. **Run** `./start-servers.sh` in terminal
2. Wait for both servers to start
3. Open your browser to `http://localhost:3000`

---

## Manual Setup (Alternative)

### Prerequisites
- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)

### Step 1: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

**Expected Output:**
```
🚀 Server running on http://localhost:8080
📊 Health check: http://localhost:8080/api/health
🔧 CORS enabled for: http://localhost:3000

👥 Default users created:
   Admin: admin/admin123
   Manager: manager/manager123
   HR: hr/hr123
   Employee: employee/employee123
```

### Step 2: Frontend Setup
```bash
# Open a new terminal window
# Navigate to frontend directory
cd login-frontend

# Install dependencies
npm install

# Start the server
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view login-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

---

## 🎯 Testing the System

### 1. Health Check
Visit: `http://localhost:8080/api/health`
Should show: `{"status":"OK","message":"Server is running"}`

### 2. Login Test
1. Go to `http://localhost:3000`
2. Select a role from dropdown
3. Use default credentials:
   - **Employee**: `employee` / `employee123`
   - **Manager**: `manager` / `manager123`
   - **HR**: `hr` / `hr123`
   - **Admin**: `admin` / `admin123`

### 3. Leave Management Test
1. Login as **Employee**
2. Apply for leave
3. Login as **Manager**
4. Go to "Leave Requests" in sidebar
5. Approve/reject the leave request

---

## 🔧 Troubleshooting

### CORS Errors Fixed ✅
- Backend now has CORS properly configured
- Frontend can communicate with backend without issues

### Common Issues:

#### "Port already in use"
```bash
# Kill process on port 8080 (backend)
npx kill-port 8080

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

#### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### "Database error"
- The SQLite database will be created automatically
- Check file permissions in the backend directory

#### "Network error"
- Make sure both servers are running
- Check that ports 3000 and 8080 are available
- Verify firewall settings

---

## 📁 Project Structure

```
project-root/
├── backend/                 # Backend server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── README.md           # Backend documentation
├── login-frontend/         # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api.js          # API configuration
│   │   └── App.js          # Main app component
│   └── package.json        # Frontend dependencies
├── start-servers.bat       # Windows startup script
├── start-servers.sh        # Unix/Linux/Mac startup script
└── SETUP.md               # This file
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/employees/login` - Login
- `POST /api/employees/reset-password` - Reset password

### Employee Management
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get specific employee
- `POST /api/employees/create` - Create employee

### Leave Management
- `GET /api/leaves` - Get all leave requests
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id/approve` - Approve leave
- `PUT /api/leaves/:id/reject` - Reject leave

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **CORS Protection**: Configured for frontend
- **Rate Limiting**: 100 requests per 15 minutes
- **Password Hashing**: bcrypt encryption
- **Input Validation**: Request validation

---

## 🎨 Features Implemented

### Frontend
- ✅ Beautiful, responsive UI
- ✅ Role-based dashboards
- ✅ Leave application system
- ✅ Manager approval interface
- ✅ Real-time status updates
- ✅ Search and filtering
- ✅ Pagination

### Backend
- ✅ Complete REST API
- ✅ SQLite database
- ✅ JWT authentication
- ✅ CORS enabled
- ✅ Error handling
- ✅ Security middleware

---

## 🚀 Next Steps

1. **Test all features** with different user roles
2. **Create sample data** by applying for leaves
3. **Test the approval workflow** as a manager
4. **Explore the UI** and try all features

---

## 📞 Support

If you encounter any issues:

1. Check the console logs in both terminal windows
2. Verify both servers are running on correct ports
3. Check the browser's developer console for errors
4. Ensure Node.js version is 14 or higher

---

## 🎉 Success!

Once both servers are running:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/health

You now have a fully functional Employee Leave Management System! 🎯