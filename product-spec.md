-- -- -- -- -- -- -- -- -- -- -- -- -- --
title : Internal operations service Hub
--- --- --- --- --- --- --- --- --- --- -


# context

- The internal operations service hub's goal is to ease communication and to handle internal operational requests in the company .

- The system is intended for only internal employees across all departments (such as : IT , HR ...) .

- The system is used for cases such as requesting papers from HR , applying for work expense , reporting problems , major updates...


# problem

- The main problem the organization is facing is with the excess of requests from all the departments , the HR would be struggling keeping up with all of them . Thus the employee's answers will arrive late depending on how capable the HR is in handling too many requests. And also the HR needs to sort the requests by most importance (to see which requests / emails are more critical - important) . 

- Thus the problem isnt the requests arriving to the HR , it is the HR replying to the employee's and departments needs .


# known facts

- The system is intended for internal employees only .

- Employees need a way to submit and track operational requests .

- Each request needs to have a status .

- Each requests should have its own tab to view the reply so the employee could go to the desired document / answer more easily .

- Employees need visibility into the progress of their requests .


# actors

- Employees
- Department Staff
- Department Managers
- HR Management
- IT Management
- Operations Management
- Company Management
- System Administrators
- Compliance / Security personel


# stakeholders

- HR Management
- Employees
- IT Staff
- IT Manager
- Operations Manager
- Company Management
- Security & Compliance staff


# functional requirements

- The system shall allow employees to submit internal requests and make those requests available to the HR Representative to review .

- The system shall allow the HR representative to sort and prioritize employee requests according to their level of importance and the HR department's defined priorities .

- The system shall categorize employee requests by type and allow the HR representative to filter requests based on their category .

- The system shall provide employees with predefined request types and options to help them identify and submit their request more easily. An "Other" option shall allow employees to describe requests that are not covered by the predefined categories .

- The system shall allow the HR representative to assign and update the status of employee requests , such as Received , In Progress , Pending , Delayed , Accepted , Rejected , Resolved , or Closed .

- The system shall allow employees to view their submitted requests and track their current status .

- THe system shall allow the HR representative to provide responses or updates to an employee's request .

- The system shall notify employees when there is a signifficant update to their request , such as a status change or a response from HR .

- The system shall maintain a history of requests and their status changes , allowing the HR representative and the corresponding employee to review previous updates .

- The system shall allow the HR representative to search for employee requests using relevant information such as request ID , eployee name (or ID) , request type , status or date .

- The system shall allow the HR representative to view the complete information associated with an employee's request and to mark a request as resolved or closed once the request has been handled .

- If a request cannot be submitted because of a system error, the employee shall be informed that the submission was unsuccessful and shall not be shown a false confirmation .


# non-functional requirements

- The system shall process an employee's request submission within 2 seconds under normal operating conditions (95% of the requests) .

- The system shall support at least multiple concurent employees without significant performance degradation (if the company had 200 employees it should at least support 25% which is 50 employees) . It shall support at least 25% of the total employees (employees = users) while maintaining acceptable performance . And it also shall support the submission and processing of at least 50% of the total employee count's requests per hour without significant performance degradation .

- The system shall be capable of handling an increasing number of requests without requiring a cmplete redesign of the system .

- The system shall be available 99.5% of the time during working hours .

- Only registered employees and HR can access the system .

- Employees can only access their own requests, while HR can access all submitted requests .

- Sensitive employee/request data must be protected during transmission and storage .

- Important actions, such as changing a request's status should be recorded .

* - Note: The five buckets that prevent bad assumptions : 


*Fact:* confirmed information

*Assumption:* temporary belief not confirmed
*Constraint:* limitation we must respect
*Unknowns:* question still needing an answer
*Non-goals:* deliberately outside current scope


# assumptions

- We must assume the company is not a very big one with thousands of employees .

- We assume each employee has one account on the system along an ID .

- We assume there is one HR employee responsible for managing requests .

- We assume employees have access to a device with an internet connection .

- We assume HR will review and process requests during working hours .

- We assume the employees will mostly have the same case , this providing options to choose from before sending a request makes things easier for the HR .

- We assume employees will send request also outside working hours .


# constraints

- The system must support a maximum of 100% of the employees .

- The system must be accessible through a web browser .

- The system must use the company's existing database / server infrastructure .

- The project must be completed within a specific deadline .

- THe system must comply with applicable data-protection requirements .

- Only one HR administrator is available to manage requests .


# unknowns

- The extact number of employees who will use the system may not be confirmed .

- The exact hosting solution may not have been chosen yet .

- It may be unknown whether the system will eventually need to support multiple HR administrators .

- The exact number of requests submitted per day may not be known .

- It may be unknown whether employees will need email/mobile notifications .


# non-goals

- The system will not handle a chatting system betweeb employees , only between HR - Employee .

- The system will not handle anything other than requests such as Salary calculations or payrolls .

- The system will not manage attendance or time tracking .

- The system is strictly for internal employees and cannot be used for things such as recruitment or job applications .

- The system will not provide automated legal or HR advice to employees .

- The system will not include multiple HR departments in the initial version .

- The system will not automatically approve or reject employees requests , HR remains responsible for decisions .


# acceptance criteria

- An employee can submit a request by selecting a request type and providing the required information .

- Each submitted request receives a unique ID and becomes visible to HR .

- HR can view, search, filter, sort, and prioritize employee requests .

- HR can update the status of a request, and the updated status is visible to the corresponding employee .

- Employees can view their submitted requests and track their current status .

- HR can respond to an employee's request, and the employee can view the response .

- Employees are notified when a significant update or response is made to their request .

- The system maintains a history of request status changes and HR responses .

- HR can mark a request as resolved or closed, while the request remains accessible in its history .

- Employees cannot access requests belonging to other employees .

- Only authenticated and authorized users can access the system and its protected functions .

- Important actions, such as status changes and responses, are recorded .

- At least 95% of request submissions are processed within 2 seconds under normal operating conditions .

- The system supports at least 50 concurrent employees and 100 requests per hour for a company of 200 employees (for example) without significant performance degradation .


-- -- -- -- -- -- -- --
*A successful case :*
--- --- --- --- --- ---

- An employee logs into the system, selects “Request an official document”, fills in all required information and submits the request. The system validates the information, creates a unique request ID, sets the request status to “Received”, makes it available to HR and confirms the submission to the employee.

-- -- -- -- -- -- -- --
*A failure case :*
--- --- --- --- --- ---

- An employee selects “Request an official document” but leaves a required field empty and attempts to submit the request. The system rejects the submission, informs the employee which information is missing and does not create the request until the required information is provided.