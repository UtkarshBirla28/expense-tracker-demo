# Expense Tracker: Proof Against Your Wife 🧾💸

Ever found yourself in a heated argument about where all the money went? Well, this Expense Tracker is here to save the day! Now you can prove (with cold, hard data) that those mysterious expenses were not yours but hers. 😉

## 🚀 Live Demo
👉 **Check it out here:** [Expense Tracker Demo](https://expense-tracker-demo-five.vercel.app)

---

## 🚀 Tech Stack
This application is built with a modern tech stack, split into two parts:

### 🖥 Client (Frontend)
- **React.js** - The backbone of our UI.
- **TypeScript** - Because we like catching bugs before they happen.
- **Tailwind CSS** - Making styles effortless.
- **Zod Validation** - Ensuring you don’t mess up inputs.
- **ShadCN** - Sleek and customizable UI components.

### 🛠 Server (Backend)
- **Node.js & Express** - Powering the API.
- **MySQL & Prisma** - Structured data for a structured life.
- **PDF Libraries** - For undeniable proof of your financial innocence.

---

## 💡 Core Focus

### Core Features:
   - Implementation of required functionalities.

### Scalability:
   - Optimized for handling large datasets, especially for the PDF export feature.

### Code Quality:
   - Maintainable, well-structured, and clean code with proper comments.

### Error Handling:
   - Robust handling of edge cases in both the frontend and backend.

### Security:
   - Use of best practices, including password hashing.

### Efficient PDF Generation:
   - One of the main focuses is generating PDFs efficiently, especially when handling large datasets.
   - To achieve this, I used workers and child threads to batch the actual creation of PDFs into their own processes, ensuring that the main thread remains unblocked.
   - At the end, I stitch all the PDFs together using **pdf-lib**. This approach is memory-efficient, as combining multiple smaller PDFs takes significantly less memory than generating one very large PDF in a single process.

---

## 📜 How to Run

1. Clone this repository.  
2. Install dependencies for both client and server.  
   ```bash
   cd client && pnpm install  
   cd ../server && pnpm install  
   ```
3. Start the backend server:  
   ```bash
   cd server && pnpm run build  # Builds and creates dist
   pnpm run start  # Starts the server
   ```
4. Start the frontend:  
   ```bash
   cd client && pnpm run dev  # Start in development mode
   pnpm run build  # Build the project
   pnpm run preview  # Preview the build
   ```
5. Open `http://localhost:5173` in development mode or `http://localhost:4173` after building for preview.

6. Update environment variables: Both client and server contain an `env.example` file. Rename it to `.env` and add the required credentials before running the application.

---

## 🤝 Contributing
Feel free to submit a PR if you have any ideas to make financial tracking even funnier (or more terrifying).  

---

## 📜 License
This project is open-source. Use it wisely (or to win financial debates). 😆

