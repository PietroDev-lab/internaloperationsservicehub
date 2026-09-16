# Internal Operations Service Hub

## 1. What is the Internal Operations Service Hub?

The Internal Operations Service Hub is the Academy's final project , it is a system used between a company's employees and the HR to handle personal requests , questions , demands. The problem to tackle is the employees not getting an answer back from the HR or a reply . The HR might get overwhelmed with many requests coming in from many employees / departments and might forget to reply to a request or fulfill an employee's demands. So this system is designed to track requests , to get answers easily and for a better way of contact between employees and HR when needed. 

Currently this project is still under-construction , you can see it's goals and architecture and data model design in the other files.

## 2. Why am I getting this repository?

💡 **Update for Week 3 (Full-Stack Delivery):** You are now getting the complete full-stack application! We have evolved from a simple backend API into a production-ready monorepo. This includes a polished React frontend, a secure NestJS backend, and a persistent SQLite database managed by Prisma. 

I am using this to learn how to deliver a complete, integrated product. You can now run the app, interact with the UI, and verify the business rules using automated Playwright End-to-End browser tests.

## 3. Which folders and files should I look at first?

```text
internaloperationsservicehub/
├── README.md              <- you are here
├── docs/                  <- contains product specs, architecture, and data models
├── prisma/                <- database schema (schema.prisma) and local SQLite database
├── src/
│   ├── backend/           <- NestJS API, JWT Auth, and business logic
│   └── frontend/          <- React UI, Tailwind CSS
├── tests/                 <- Playwright End-to-End browser tests
└── package.json           <- dependencies and scripts
```

The core planning behavior lives in the `docs` folder. The new backend implementation lives in `src/backend` and the new UI is in `src/frontend`.

## 4. How to run the application

Now that we have a full-stack application, you need to set up the database and run both the frontend and backend servers.

1. First, make sure you install all dependencies:
   ```bash
   npm install
   ```
2. Next, generate and push the database schema to create your local SQLite database:
   ```bash
   npx prisma db push
   ```
3. Finally, start the development servers (this will boot both the API and the React UI simultaneously):
   ```bash
   npm run dev
   ```
   *(The frontend will be available at http://localhost:3000 and the backend API on port 3030)*

## 5. How to verify the code works (Automated Tests)

For this sprint, we replaced the old HTTP tests with full browser automation using **Playwright**. These End-to-End (E2E) tests verify that the entire system works together seamlessly: an employee can log in, create a request, HR can resolve it, and the employee sees the updated status.

To verify the system, run this command in your terminal:
```bash
npm run test:e2e
```

**What output = success?**
If everything is working correctly, Playwright will run a headless Chromium browser, click through the UI automatically, and output a success message similar to this:

`✓  1 [chromium] › tests/e2e.spec.ts:4:3 › Property 7: Meaningful E2E Test (Full Flow) › Employee creates request, HR resolves it, Employee sees update`
