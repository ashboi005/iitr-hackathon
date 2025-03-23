# Cracked Nerds - Freelancer and Employer Platform

## Problem Statement

The problem we are addressing involves the trust issues between employers and freelancers when it comes to payment during the project lifecycle. Employers are often hesitant to pay the full amount upfront without any work being done, while freelancers require assurance that they will receive payment for each milestone achieved. Our solution is a platform that ensures trust, transparency, and secure payments for both parties.

## Solution Overview

We built a platform that streamlines the interaction between employers and freelancers by using blockchain technology and smart contracts to facilitate milestone-based payments. The platform consists of several components:

1. **Main App (Frontend: Next.js, Backend: FastAPI)**  
   The main app serves as the hub for employers and freelancers. Employers can post jobs (gigs), set milestones, and define payments for each milestone. Freelancers can browse and apply for gigs. The system is powered by FastAPI on the backend and Next.js for the frontend.

2. **Smart Contract & Escrow System**  
   When an employer creates a gig, they define milestones and corresponding payments. The first milestone payment is sent to a smart contract in a decentralized escrow system. As each milestone is completed, the employer approves the milestone, releasing the payment to the freelancer, and the next milestone payment is added to the escrow.

3. **Admin & Ticketing System (Frontend: React, Backend: Flask)**  
   In case of any disputes between employers and freelancers, both parties can raise tickets, which are managed by an admin. The admin dashboard is built using Flask for the backend and React for the frontend. The admin has the ability to ban users if necessary. The ticketing system includes a chat feature for communication between users and admins.

4. **AWS Deployment & S3 Storage**  
   The platform is deployed using AWS services, and we use S3 buckets to store user profile pictures and other necessary assets.

## Features

- **Freelancer & Employer Interaction**  
  Employers can post gigs with multiple milestones, and freelancers can apply for gigs. After approval, milestone payments are secured in a blockchain-based escrow system.
  
- **Escrow & Blockchain Integration**  
  Payments for each milestone are handled through smart contracts, ensuring that freelancers are paid for completed work, and employers only release funds when milestones are approved.

- **Admin Dashboard**  
  Admins can manage users, view ticket statuses, and take action if disputes arise. Admins also have the ability to ban users for violating platform rules.

- **Ticketing System**  
  Both employers and freelancers can raise and track the status of disputes. The platform includes a chat system for communication between users and admins.

- **Profile Management**  
  Users can upload their profile pictures and store links to external profiles or work portfolios.

## Technology Stack

- **Frontend**:  
  - Next.js (Main App)  
  - React (Admin Panel)
  
- **Backend**:  
  - FastAPI (Main App)  
  - Flask (Admin Panel)

- **Blockchain**:  
  - Smart Contracts for escrow and milestone payments
  
- **Database**:  
  - Decentralized database for storing milestone payments and other critical data

- **Storage**:  
  - AWS S3 for storing profile pictures and links
  
- **Deployment**:  
  - AWS (for hosting the main backend)
  - Railway (for hosting the admin panel backend)
  - Vercel (for hosting the frontend

## Team Members

- **Ashwath Soni** – Backend Development (FastAPI)
- **Harnoor Singh Arora** – Frontend Development (Next.js)
- **Tushar Dhingra** – Admin Panel (Frontend & Backend in React and Flask)
- **Sahil Chawda** – Backend Development (Next.js Integration, Blockchain)

## How to Run the Project

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. **Backend Setup**:
   - Install dependencies for FastAPI:
     ```bash
     cd backend
     pip install -r requirements.txt
     ```

3. **Frontend Setup**:
   - Install dependencies for Next.js:
     ```bash
     cd frontend
     npm install
     ```

4. **Admin Panel Setup**:
   - Install dependencies for the Admin Panel:
     ```bash
     cd admin
     cd frontend
     npm install
     ```
     then
     ```bash
     cd backend
     pip install -r requirements.txt

5. **Blockchain Setup**:
   - Follow the instructions in the blockchain directory to set up and deploy smart contracts.

6. **Run the Backend**:
   - Start the FastAPI server:
     ```bash
     uvicorn main:app --reload
     ```

7. **Run the Frontend**:
   - Start the Next.js app:
     ```bash
     npm run dev
     ```

8. **Run the Admin Panel**:
   - Start the Admin Panel Frontend
     ```bash
     npm run dev
     ```
     ```bash
     flask run
     ```

## Conclusion

The **Workly** platform is designed to solve the payment and trust issues faced by freelancers and employers by utilizing blockchain for secure payments and providing a comprehensive dispute resolution system. By integrating these technologies, we provide a transparent, secure, and reliable environment for both parties.
