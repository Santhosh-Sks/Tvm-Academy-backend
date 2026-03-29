# TVM Academy - System Flow Diagrams

## System Flow Diagrams Collection

This document contains detailed system flow diagrams for various processes within the TVM Academy Education Management System.

---

## 1. Overall System Flow Diagram

```
    ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
    │   Public    │         │   Student   │         │    Admin    │
    │   Users     │         │    Users    │         │    Users    │
    └─────┬───────┘         └─────┬───────┘         └─────┬───────┘
          │                       │                       │
          ▼                       ▼                       ▼
    ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
    │ Browse      │         │ Login/      │         │ Admin       │
    │ Courses     │         │ Register    │         │ Dashboard   │
    └─────┬───────┘         └─────┬───────┘         └─────┬───────┘
          │                       │                       │
          ▼                       ▼                       ▼
    ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
    │ Submit      │         │ View        │         │ Manage      │
    │ Enquiry     │         │ Dashboard   │         │ Courses     │
    └─────┬───────┘         └─────┬───────┘         └─────┬───────┘
          │                       │                       │
          ▼                       ▼                       ▼
    ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
    │ Receive     │         │ Enroll in   │         │ Handle      │
    │ Confirmation│         │ Courses     │         │ Enquiries   │
    └─────┬───────┘         └─────┬───────┘         └─────┬───────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                                  ▼
                        ┌─────────────────┐
                        │   Database      │
                        │   Operations    │
                        │   (MongoDB)     │
                        └─────────────────┘
```

---

## 2. User Registration & Authentication Flow

```
START: User wants to access system
│
▼
┌─────────────────┐
│ User visits     │
│ application     │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐     No    ┌─────────────────┐
│ Authenticated?  │──────────▶│ Show Login/     │
│                 │           │ Register Options│
└─────┬───────────┘           └─────┬───────────┘
      │ Yes                         │
      ▼                             ▼
┌─────────────────┐           ┌─────────────────┐
│ Direct to       │           │ User selects    │
│ Dashboard       │           │ Register        │
└─────────────────┘           └─────┬───────────┘
                                    │
                                    ▼
                              ┌─────────────────┐
                              │ Fill            │
                              │ Registration    │
                              │ Form            │
                              └─────┬───────────┘
                                    │
                                    ▼
                              ┌─────────────────┐     No
                              │ Validate        │────┐
                              │ Form Data       │    │
                              └─────┬───────────┘    │
                                    │ Yes            │
                                    ▼                │
                              ┌─────────────────┐    │
                              │ Send            │    │
                              │ Verification    │    │
                              │ Email           │    │
                              └─────┬───────────┘    │
                                    │                │
                                    ▼                │
                              ┌─────────────────┐    │
                              │ User verifies   │    │
                              │ email           │    │
                              └─────┬───────────┘    │
                                    │                │
                                    ▼                │
                              ┌─────────────────┐    │
                              │ Account         │    │
                              │ Activated       │    │
                              └─────┬───────────┘    │
                                    │                │
                                    ▼                │
                              ┌─────────────────┐    │
                              │ Login with      │    │
                              │ Credentials     │    │
                              └─────┬───────────┘    │
                                    │                │
                                    ▼                │
                              ┌─────────────────┐    │
                              │ Generate JWT    │    │
                              │ Token           │    │
                              └─────┬───────────┘    │
                                    │                │
                                    ▼                │
                              ┌─────────────────┐    │
                              │ Store token in  │    │
                              │ Local Storage   │    │
                              └─────┬───────────┘    │
                                    │                │
                                    ▼                │
                              ┌─────────────────┐    │
                              │ Redirect to     │    │
                              │ Dashboard       │    │
                              └─────────────────┘    │
                                                     │
                              ┌─────────────────┐    │
                              │ Show Validation │◀───┘
                              │ Errors          │
                              └─────────────────┘
```

---

## 3. Course Management Flow (Admin)

```
START: Admin wants to manage courses
│
▼
┌─────────────────┐
│ Admin logs in   │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Navigate to     │
│ Manage Courses  │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ View Courses    │
│ List            │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Select Action:  │
│ • Add New       │
│ • Edit Existing │
│ • Delete Course │
│ • View Details  │
└─────┬───────────┘
      │
┌─────┼─────┬─────┬─────┐
▼     ▼     ▼     ▼     ▼
ADD   EDIT  DELETE VIEW MORE

┌─────────────────┐
│ ADD NEW COURSE  │
├─────────────────┤
│ Fill Course     │
│ Details Form:   │
│ • Title         │
│ • Description   │
│ • Duration      │
│ • Fee           │
│ • Category      │
│ • Instructor    │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐     No    ┌─────────────────┐
│ Validate Input  │──────────▶│ Show Validation │
│                 │           │ Errors          │
└─────┬───────────┘           └─────────────────┘
      │ Yes
      ▼
┌─────────────────┐
│ Save to         │
│ Database        │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Show Success    │
│ Message         │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Refresh Course  │
│ List            │
└─────────────────┘

┌─────────────────┐
│ EDIT COURSE     │
├─────────────────┤
│ Load existing   │
│ course data     │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Pre-populate    │
│ form fields     │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Modify fields   │
│ as needed       │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐     No    ┌─────────────────┐
│ Validate        │──────────▶│ Show Validation │
│ Changes         │           │ Errors          │
└─────┬───────────┘           └─────────────────┘
      │ Yes
      ▼
┌─────────────────┐
│ Update in       │
│ Database        │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Show Success    │
│ Message         │
└─────────────────┘

┌─────────────────┐
│ DELETE COURSE   │
├─────────────────┤
│ Show            │
│ Confirmation    │
│ Dialog          │
└─────┬───────────┘
      │
┌─────▼─────┐
│ Confirm?  │
├───────────┤
│ Yes │ No  │
└─┬─────┬───┘
  │     │
  ▼     ▼
┌─────────────────┐  ┌─────────────────┐
│ Check if course │  │ Cancel          │
│ has enrollments │  │ operation       │
└─────┬───────────┘  └─────────────────┘
      │
      ▼
┌─────────────────┐     Yes   ┌─────────────────┐
│ Has enrolled    │──────────▶│ Cannot delete   │
│ students?       │           │ Show warning    │
└─────┬───────────┘           └─────────────────┘
      │ No
      ▼
┌─────────────────┐
│ Mark as         │
│ inactive/       │
│ archived        │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Update          │
│ Database        │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Refresh List    │
└─────────────────┘
```

---

## 4. Student Enrollment Process Flow

```
START: Student wants to enroll in a course
│
▼
┌─────────────────┐
│ Student browses │
│ course catalog  │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Select desired  │
│ course          │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ View course     │
│ details page    │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐     No    ┌─────────────────┐
│ User logged in? │──────────▶│ Redirect to     │
│                 │           │ login page      │
└─────┬───────────┘           └─────┬───────────┘
      │ Yes                         │
      ▼                             │
┌─────────────────┐                 │
│ Click "Enroll   │                 │
│ Now" button     │                 │
└─────┬───────────┘                 │
      │                             │
      ▼                             │
┌─────────────────┐     Yes   ┌─────▼─────────────┐
│ Already         │──────────▶│ After login,      │
│ enrolled?       │           │ redirect back to  │
└─────┬───────────┘           │ course page       │
      │ No                    └───────────────────┘
      ▼
┌─────────────────┐     Yes   ┌─────────────────┐
│ Course full?    │──────────▶│ Show "Course    │
│                 │           │ Full" message   │
└─────┬───────────┘           └─────────────────┘
      │ No
      ▼
┌─────────────────┐
│ Show enrollment │
│ form with       │
│ course details  │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Display payment │
│ options:        │
│ • Credit Card   │
│ • UPI           │
│ • Net Banking   │
│ • Wallet        │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ User selects    │
│ payment method  │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Fill payment    │
│ details         │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐     No    ┌─────────────────┐
│ Validate        │──────────▶│ Show validation │
│ payment info    │           │ errors          │
└─────┬───────────┘           └─────────────────┘
      │ Yes
      ▼
┌─────────────────┐
│ Process payment │
│ through gateway │
└─────┬───────────┘
      │
┌─────▼─────┬─────┬─────┐
▼           ▼     ▼     ▼
SUCCESS   FAILED PENDING

┌─────────────────┐
│ PAYMENT SUCCESS │
├─────────────────┤
│ Create          │
│ enrollment      │
│ record          │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Send            │
│ confirmation    │
│ email           │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Update course   │
│ enrollment      │
│ count           │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Redirect to     │
│ "My Courses"    │
│ page            │
└─────────────────┘

┌─────────────────┐
│ PAYMENT FAILED  │
├─────────────────┤
│ Show error      │
│ message         │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Option to       │
│ retry payment   │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Log failed      │
│ transaction     │
└─────────────────┘

┌─────────────────┐
│ PAYMENT PENDING │
├─────────────────┤
│ Show pending    │
│ status          │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Create pending  │
│ enrollment      │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Set up payment  │
│ verification    │
│ webhook         │
└─────────────────┘
```

---

## 5. Enquiry Management Flow

```
START: Visitor has a question about a course
│
▼
┌─────────────────┐
│ Visitor browses │
│ course page     │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Clicks "Make    │
│ Enquiry" or     │
│ "Contact Us"    │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Fill enquiry    │
│ form:           │
│ • Name          │
│ • Email         │
│ • Phone         │
│ • Course        │
│ • Message       │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐     No    ┌─────────────────┐
│ Validate form   │──────────▶│ Show validation │
│ data            │           │ errors          │
└─────┬───────────┘           └─────┬───────────┘
      │ Yes                         │
      ▼                             │
┌─────────────────┐                 │
│ Submit enquiry  │                 │
└─────┬───────────┘                 │
      │                             │
      ▼                             │
┌─────────────────┐                 │
│ Save to         │                 │
│ database with   │                 │
│ status: "new"   │                 │
└─────┬───────────┘                 │
      │                             │
      ▼                             │
┌─────────────────┐                 │
│ Send            │                 │
│ confirmation    │                 │
│ email to user   │                 │
└─────┬───────────┘                 │
      │                             │
      ▼                             │
┌─────────────────┐                 │
│ Notify admin    │                 │
│ about new       │                 │
│ enquiry         │                 │
└─────┬───────────┘                 │
      │                             │
      ▼                             │
┌─────────────────┐                 │
│ Show success    │◀────────────────┘
│ message to      │
│ visitor         │
└─────┬───────────┘
      │
      ▼
END: Enquiry submitted successfully

--- ADMIN SIDE ---

START: Admin reviews enquiries
│
▼
┌─────────────────┐
│ Admin logs in   │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Navigate to     │
│ "View           │
│ Enquiries"      │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ View list of    │
│ enquiries with  │
│ filters:        │
│ • Status        │
│ • Course        │
│ • Date Range    │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Select enquiry  │
│ to review       │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ View enquiry    │
│ details         │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Admin chooses   │
│ action:         │
│ • Contact       │
│ • Approve       │
│ • Reject        │
│ • Request Info  │
└─────┬───────────┘
      │
┌─────┼─────┬─────┬─────┬─────┐
▼     ▼     ▼     ▼     ▼
CONTACT APPROVE REJECT REQ_INFO

┌─────────────────┐
│ CONTACT         │
├─────────────────┤
│ Update status   │
│ to "contacted"  │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Add admin       │
│ notes           │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Set follow-up   │
│ date            │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Send response   │
│ email           │
└─────────────────┘

┌─────────────────┐
│ APPROVE         │
├─────────────────┤
│ Update status   │
│ to "approved"   │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Generate        │
│ payment token   │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Create payment  │
│ link (24h       │
│ expiry)         │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Send payment    │
│ link via email  │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Update status   │
│ to "payment_    │
│ sent"           │
└─────────────────┘

┌─────────────────┐
│ REJECT          │
├─────────────────┤
│ Update status   │
│ to "closed"     │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Add rejection   │
│ reason in       │
│ admin notes     │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Send polite     │
│ rejection email │
└─────────────────┘

--- PAYMENT COMPLETION ---

START: User receives payment link
│
▼
┌─────────────────┐     No    ┌─────────────────┐
│ Link valid &    │──────────▶│ Show "Link      │
│ not expired?    │           │ Expired" page   │
└─────┬───────────┘           └─────────────────┘
      │ Yes
      ▼
┌─────────────────┐
│ Show course     │
│ details &       │
│ payment form    │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Process         │
│ payment         │
└─────┬───────────┘
      │
┌─────▼─────┬─────┐
▼           ▼     ▼
SUCCESS   FAILED

┌─────────────────┐  ┌─────────────────┐
│ Create          │  │ Update enquiry  │
│ enrollment      │  │ with payment    │
│ record          │  │ failure reason  │
└─────┬───────────┘  └─────────────────┘
      │
      ▼
┌─────────────────┐
│ Update enquiry  │
│ status to       │
│ "enrolled"      │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Send enrollment │
│ confirmation    │
│ email           │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Create user     │
│ account if      │
│ doesn't exist   │
└─────────────────┘
```

---

## 6. Admin Reports & Analytics Flow

```
START: Admin wants to view reports
│
▼
┌─────────────────┐
│ Admin navigates │
│ to Reports      │
│ section         │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Load dashboard  │
│ with real-time  │
│ statistics      │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Display:        │
│ • Total Courses │
│ • Total Students│
│ • Enrollments   │
│ • Revenue       │
│ • Enquiries     │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Select report   │
│ type:           │
│ • Dashboard     │
│ • Monthly       │
│ • Yearly        │
│ • Custom        │
└─────┬───────────┘
      │
┌─────┼─────┬─────┬─────┬─────┐
▼     ▼     ▼     ▼     ▼
DASH  MONTHLY YEARLY CUSTOM

┌─────────────────┐
│ DASHBOARD       │
├─────────────────┤
│ Real-time data: │
│ • Current month │
│   enrollments   │
│ • Revenue       │
│ • Course        │
│   performance   │
│ • Enquiry       │
│   conversion    │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Interactive     │
│ charts &        │
│ graphs          │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Option to       │
│ download as     │
│ JSON/CSV        │
└─────────────────┘

┌─────────────────┐
│ MONTHLY REPORT  │
├─────────────────┤
│ Select month    │
│ and year        │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Generate report │
│ with:           │
│ • Enrollments   │
│ • Revenue       │
│ • Popular       │
│   courses       │
│ • Enquiries     │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Display         │
│ tabular data    │
│ with charts     │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Download        │
│ options         │
└─────────────────┘

┌─────────────────┐
│ YEARLY REPORT   │
├─────────────────┤
│ Select year     │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Aggregate data  │
│ by quarters/    │
│ months          │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Show trends     │
│ and growth      │
│ patterns        │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Comparison      │
│ with previous   │
│ year            │
└─────────────────┘

┌─────────────────┐
│ CUSTOM REPORT   │
├─────────────────┤
│ Select:         │
│ • Date range    │
│ • Metrics       │
│ • Filters       │
│ • Format        │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Validate        │
│ parameters      │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐     No    ┌─────────────────┐
│ Valid inputs?   │──────────▶│ Show error      │
│                 │           │ message         │
└─────┬───────────┘           └─────────────────┘
      │ Yes
      ▼
┌─────────────────┐
│ Query database  │
│ with filters    │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Format data     │
│ according to    │
│ selection       │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Display report  │
│ with download   │
│ option          │
└─────────────────┘

--- DOWNLOAD PROCESS ---

START: User clicks download
│
▼
┌─────────────────┐
│ Select format:  │
│ • JSON          │
│ • CSV           │
│ • PDF           │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Format data     │
│ according to    │
│ selection       │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Generate file   │
│ with timestamp  │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Trigger         │
│ download in     │
│ browser         │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Log download    │
│ activity        │
└─────────────────┘
```

---

## 7. Error Handling & Recovery Flow

```
START: Application encounters an error
│
▼
┌─────────────────┐
│ Error occurs    │
│ in application  │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Error type:     │
│ • Network       │
│ • Validation    │
│ • Server        │
│ • Database      │
│ • Authentication│
└─────┬───────────┘
      │
┌─────┼─────┬─────┬─────┬─────┬─────┐
▼     ▼     ▼     ▼     ▼     ▼
NET  VALID SERV  DB   AUTH

┌─────────────────┐
│ NETWORK ERROR   │
├─────────────────┤
│ Check           │
│ connectivity    │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐     No    ┌─────────────────┐
│ Internet        │──────────▶│ Show "No        │
│ available?      │           │ Connection"     │
└─────┬───────────┘           │ message         │
      │ Yes                   └─────┬───────────┘
      ▼                             │
┌─────────────────┐                 │
│ Retry API       │                 │
│ call with       │                 │
│ exponential     │                 │
│ backoff         │                 │
└─────┬───────────┘                 │
      │                             │
┌─────▼─────┐                       │
│ Success?  │                       │
├───────────┤                       │
│ Yes │ No  │                       │
└─┬─────┬───┘                       │
  ▼     ▼                           │
┌─────────────────┐ ┌─────────────────┐
│ Continue normal │ │ Show retry      │
│ operation       │ │ button          │
└─────────────────┘ └─────┬───────────┘
                          │
                          └─────────────┐
                                        │
┌─────────────────┐                     │
│ VALIDATION ERROR│                     │
├─────────────────┤                     │
│ Collect all     │                     │
│ validation      │                     │
│ errors          │                     │
└─────┬───────────┘                     │
      │                                 │
      ▼                                 │
┌─────────────────┐                     │
│ Display errors  │                     │
│ next to form    │                     │
│ fields          │                     │
└─────┬───────────┘                     │
      │                                 │
      ▼                                 │
┌─────────────────┐                     │
│ Highlight       │                     │
│ invalid fields  │                     │
│ in red          │                     │
└─────┬───────────┘                     │
      │                                 │
      ▼                                 │
┌─────────────────┐                     │
│ Focus on first  │                     │
│ invalid field   │                     │
└─────┬───────────┘                     │
      │                                 │
      ▼                                 │
┌─────────────────┐                     │
│ User corrects   │                     │
│ errors and      │                     │
│ resubmits       │                     │
└─────────────────┘                     │
                                        │
┌─────────────────┐                     │
│ SERVER ERROR    │                     │
├─────────────────┤                     │
│ Log error       │                     │
│ details         │                     │
└─────┬───────────┘                     │
      │                                 │
      ▼                                 │
┌─────────────────┐                     │
│ Check error     │                     │
│ severity:       │                     │
│ • Critical      │                     │
│ • Warning       │                     │
│ • Info          │                     │
└─────┬───────────┘                     │
      │                                 │
┌─────▼─────┬─────┬─────┐                │
▼           ▼     ▼     ▼                │
CRITICAL  WARNING INFO                  │
                                        │
┌─────────────────┐                     │
│ Show generic    │                     │
│ "Something went │                     │
│ wrong" message  │                     │
└─────┬───────────┘                     │
      │                                 │
      ▼                                 │
┌─────────────────┐                     │
│ Offer contact   │                     │
│ support option  │                     │
└─────┬───────────┘                     │
      │                                 │
      ▼                                 │
┌─────────────────┐                     │
│ Log incident    │                     │
│ for admin       │                     │
│ review          │                     │
└─────────────────┘                     │
                                        │
┌─────────────────┐                     │
│ DATABASE ERROR  │                     │
├─────────────────┤                     │
│ Check           │                     │
│ connection      │                     │
└─────┬───────────┘                     │
      │                                 │
      ▼                                 │
┌─────────────────┐     No    ┌─────────▼───────┐
│ DB reachable?   │──────────▶│ Show maintenance│
│                 │           │ mode message    │
└─────┬───────────┘           └─────────────────┘
      │ Yes                                     
      ▼                                         
┌─────────────────┐                             
│ Query timeout   │                             
│ or data issue?  │                             
└─────┬───────────┘                             
      │                                         
      ▼                                         
┌─────────────────┐                             
│ Use cached      │                             
│ data if         │                             
│ available       │                             
└─────┬───────────┘                             
      │                                         
      ▼                                         
┌─────────────────┐                             
│ Notify admin    │                             
│ of DB issues    │                             
└─────────────────┘                             

┌─────────────────┐
│ AUTH ERROR      │
├─────────────────┤
│ Token expired   │
│ or invalid?     │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Clear local     │
│ storage         │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Redirect to     │
│ login page      │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Show "Session   │
│ expired" msg    │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ After login,    │
│ redirect back   │
│ to original     │
│ page            │
└─────────────────┘
```

This comprehensive collection of system flow diagrams provides a detailed visual representation of all major processes within the TVM Academy system. Each diagram shows the step-by-step flow of operations, decision points, and error handling scenarios.
