# Internal Operations Service Hub

## 1. What is the Internal Operations Service Hub?

The Internal Operations Service Hub is the Academy's final project , it is a system used between a company's employees and the HR to handle personal requests , questions , demands. The problem to tackle is the employees not getting an answer back from the HR or a reply . The HR might get overwhelmed with many requests coming in from many employees / departments and might forget to reply to a request or fulfill an employee's demands. So this system is designed to track requests , to get answers easily and for a better way of contact between employees and HR when needed. 

Currently this project is still under-construction , you can see it's goals and architecture and data model design in the other files.

## 2. Why am I getting this repository?

💡
**Update for Week 2:** You are now getting the first working slice of the backend application! I have prepared this repository to hold the initial specifications and designs, and now the first coded feature: the HR Requests tracking system.

I am using this to learn how engineers build and test backend APIs based on the initial product specs. You can now run the code and verify the business rules using the automated tests.

## 3. Which folders and files should I look at first?

```text
internaloperationsservicehub/
├── README.md              <- you are here
├── docs/                  <- contains product specs, architecture, and data models
├── src/                   <- the actual backend code (NestJS)
│   └── requests/          <- the feature slice we just built
├── run-http-tests.ts      <- the automated test script
└── package.json           <- dependencies
```

The core planning behavior lives in the `docs` folder. The new backend implementation lives in `src/requests`.

## 4. How to run the application

Now that we have actual code, you can start the development server to test the API manually.

1. First, make sure you install the dependencies:
   ```bash
   npm install
   ```
2. Then, start the development server:
   ```bash
   npm run dev
   ```
   *(This will start the server on port 3000)*

## 5. How to verify the code works (Automated Tests)

I wrote an automated HTTP test script to prove that the business rules and state constraints (like preventing a ticket from skipping straight to "Resolved") are working perfectly.

To verify the code, run this command in your terminal:
```bash
npx tsx run-http-test.ts
```

**What output = success?**
If everything is working correctly, the script will output the results of 5 different test phases. You should look for this exact line at the very bottom of the terminal:

`✅ RESULT: ALL HTTP TESTS PASSED. Constraints actively rejected invalid payloads.`
