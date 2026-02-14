# Car Rental Management System

A modern, responsive React-based dashboard for managing car rental operations. This application allows rental agencies to track their fleet, manage bookings, handle client databases, and monitor financial expenses alongside visual timeline tracking.

## 🚀 Key Features

### 1. **Fleet Management**
- **Vehicle Inventory:** Add, edit, and delete vehicles.
- **Status Tracking:** Monitor vehicle status (Available, Rented, Maintenance).
- **Filtering:** Filter fleet by status or search by brand/model/plate.
- **Detailed Form:** Capture vehicle details including Brand (with cascading models for Renault, Peugeot, Dacia), Plate, Rates, Fuel Type, Transmission, and Images.

### 2. **Booking System**
- **New Bookings:** Create bookings with automatic cost calculation based on daily rates.
- **Availability Check:** Smart conflict detection prevents double-booking of vehicles.
- **Mileage Tracking:** 
    - Record **Starting KM** when a car leaves.
    - Record **Ending KM** when a car returns (visible only for past/completed bookings).
- **Edit & Manage:** Update existing bookings or mark them as "Completed" / "Cancelled".
- **Visual Calendar:** Date picker with blocked dates indication.

### 3. **Interactive Timeline**
- **Visual Dashboard:** A horizontaly scrollable Gantt-chart style timeline.
- **Real-time Status:** Color-coded bars for Active Rentals (Blue) and Maintenance (Red).
- **Today Highlight:** Distinct visual marker for the current day to easily track ongoing events.

### 4. **Client Database**
- **Client Profiles:** Store customer details (Name, Email, Phone, License Number, Address).
- **Booking History:** View total booking counts per client.
- **Search:** Instant search by name, email, or phone.
- **Stats:** Quick view of "New Clients this Month" and "Active Bookings".

### 5. **Financial & Expense Tracking**
- **Expenses:** Log operational costs (Maintenance, Fuel, Insurance, etc.).
- **Revenue Stats:** Track total revenue and monthly earnings.
- **Profitability:** View simplified financial health metrics.

### 6. **Global Notifications**
- **Toast System:** Instant feedback (Success/Error messages) for all major actions (Creating bookings, updating clients, etc.).

---

## 🛠️ Technology Stack
- **Frontend Framework:** React (Vite)
- **Styling:** Tailwind CSS (for strictly utility-based styling) + Lucide React (Icons)
- **State Management:** React Context API (`AppContext`)
- **Persistence:** LocalStorage (Data remains available after refresh)
- **Date Handling:** Native JavaScript Date objects with custom "YYYY-MM-DD" string normalization for timezone safety.

---

## 🔄 User Flows

### **A. Creating a New Booking**
1. Navigate to **Bookings** page or click "New Booking".
2. Select a **Vehicle** (Dropdown filters available cars).
3. Select **Customer** details (Name, Email, Phone).
4. Choose **Dates** on the calendar (Green = Available, Crossed out = Blocked).
5. Enter **Starting KM** (Auto-filled from vehicle's last known mileage).
6. Click **Confirm**. 
   - *System updates vehicle status to "Rented".*
   - *Booking appears on Timeline.*

### **B. Returning a Vehicle**
1. Go to **Bookings** list.
2. Find the active booking and click **Edit**.
3. Verify dates.
4. Enter **Ending KM** (Field appears if date is today or past).
5. (Optional) Mark status as "Completed".
6. *Vehicle status automatically reverts to "Available" (if logic is extended) or manual toggle.*

### **C. Managing Fleet**
1. Go to **Fleet** page.
2. Click **Add Vehicle**.
3. Select Brand (e.g., Renault).
4. Select Model (e.g., Clio - auto-populated based on brand).
5. Fill details and **Save**.
6. Use the **Status Toggle** on vehicle cards to manually switch between Available/Maintenance.

---

## 📂 Project Structure
```
src/
├── components/
│   ├── bookings/       # Booking modal, calendar grid
│   ├── clients/        # Client list, modal
│   ├── common/         # Reusable UI (Buttons, Modals, Inputs)
│   ├── dashboard/      # Timeline, Stats cards
│   ├── expenses/       # Expense tracking
│   └── fleet/          # Vehicle cards, Add/Edit modal
├── context/
│   ├── AppContext.jsx          # Main global state (Vehicles, Bookings, Clients)
│   └── NotificationContext.jsx # Toast notification logic
├── pages/              # Main route views (Dashboard, Fleet, Bookings, etc.)
└── utils/              # Helpers (date formatting, ID generation)
```

## 📦 Requirements
- Node.js (v14 or higher)
- NPM or Yarn
