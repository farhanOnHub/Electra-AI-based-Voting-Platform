# Electra - Testing & Verification Guide

Comprehensive guide to test all features of the Electra voting platform.

## Pre-Testing Checklist

- [ ] Backend is running (`npm run dev` on port 5000)
- [ ] Frontend is running (`npm run dev` on port 3000)
- [ ] MongoDB Atlas is connected
- [ ] `.env` files are properly configured
- [ ] No console errors
- [ ] Browser localStorage is empty (clear if needed)

## 1. Authentication Testing

### 1.1 User Registration

**Test Steps:**
1. Go to `http://localhost:3000/register`
2. Fill in form with:
   - Name: "John Voter"
   - Email: "voter@example.com"
   - Organization: "Test University"
   - Password: "securepassword123"
   - Role: "Regular User"
3. Click "Create Account"

**Expected Results:**
- [ ] Form validates email format
- [ ] Password minimum length (6 chars) enforced
- [ ] Success toast notification appears
- [ ] Redirects to dashboard
- [ ] User data in localStorage
- [ ] JWT token stored

**Failure Scenarios to Test:**
- [ ] Duplicate email rejection
- [ ] Invalid email format
- [ ] Password too short
- [ ] Missing required fields

### 1.2 User Login

**Test Steps:**
1. Logout if logged in (click logout)
2. Go to `http://localhost:3000/login`
3. Enter credentials:
   - Email: "voter@example.com"
   - Password: "securepassword123"
4. Click "Sign In"

**Expected Results:**
- [ ] Login succeeds
- [ ] Redirects to dashboard
- [ ] User info displays in navbar
- [ ] Token stored in localStorage

**Failure Scenarios:**
- [ ] Invalid password rejected
- [ ] Non-existent user rejected
- [ ] Error message displays

### 1.3 Profile Management

**Test Steps:**
1. Login successfully
2. Click on profile icon in navbar
3. Update name or organization
4. Click save

**Expected Results:**
- [ ] Profile updates successfully
- [ ] Updated info displays
- [ ] Success notification shows

### 1.4 Logout

**Test Steps:**
1. Click logout button
2. Try accessing protected routes

**Expected Results:**
- [ ] Redirects to login
- [ ] Token removed from storage
- [ ] Cannot access dashboard

## 2. Event Management Testing

### 2.1 Create Event (Admin)

**Setup:**
1. Register as "Event Organizer" (Admin role)
2. Navigate to Admin Panel

**Test Steps:**
1. Click "Create New Event"
2. Fill form:
   - Title: "Student Council Elections"
   - Description: "Vote for your council representatives"
   - Start Time: Current time + 1 minute
   - End Time: Current time + 30 minutes
3. Click "Create Event"

**Expected Results:**
- [ ] Event created successfully
- [ ] Toast notification shows
- [ ] Event appears in list
- [ ] Event code generated (shown as ABC123 format)
- [ ] Status is "upcoming"

### 2.2 Add Candidates

**Test Steps:**
1. In admin panel, click on created event
2. Go to "Add Candidates" section
3. Add 3 candidates:
   - Name: "Alice Johnson" | Position: "President" | Bio: "Strong leader"
   - Name: "Bob Smith" | Position: "President" | Bio: "Experienced"
   - Name: "Carol Davis" | Position: "President" | Bio: "Innovative"

**Expected Results:**
- [ ] Candidates added successfully
- [ ] Each candidate shows in list
- [ ] Vote count starts at 0

### 2.3 Update Event

**Test Steps:**
1. Edit event start/end times
2. Update description
3. Save changes

**Expected Results:**
- [ ] Changes saved successfully
- [ ] Updated info displays
- [ ] No data loss

### 2.4 Event Status

**Test Steps:**
1. Wait for event start time
2. Refresh page
3. Check status changes

**Expected Results:**
- [ ] Status changes from "upcoming" to "active"
- [ ] Users can now vote
- [ ] Real-time updates work

## 3. User Event Management Testing

### 3.1 Join Event

**Test Steps:**
1. Login as regular user
2. Go to dashboard
3. Find "Join an Event" section
4. Enter event code from admin
5. Click "Join Event"

**Expected Results:**
- [ ] Event successfully joined
- [ ] Event appears in "Joined Events" tab
- [ ] User can see candidates

### 3.2 Event Search & Filter

**Test Steps:**
1. Create multiple events
2. Use search box with event title
3. Filter by status (upcoming/active/completed)

**Expected Results:**
- [ ] Search filters events correctly
- [ ] Case-insensitive search works
- [ ] Status filter works

## 4. Voting System Testing

### 4.1 Cast Vote

**Test Steps:**
1. Navigate to joined active event
2. Click "Vote Now" button
3. Select a candidate
4. Confirm vote

**Expected Results:**
- [ ] Vote submitted successfully
- [ ] Vote success notification
- [ ] "Already Voted" message appears
- [ ] Candidate vote count increases

### 4.2 Duplicate Vote Prevention

**Test Steps:**
1. After voting, try to vote again
2. Select different candidate
3. Try to confirm

**Expected Results:**
- [ ] Error: "You have already voted"
- [ ] Vote button disabled
- [ ] Cannot submit another vote

### 4.3 Vote Timing

**Test Steps:**
1. Try voting before event start
2. Try voting after event end

**Expected Results:**
- [ ] Before start: "Vote When Active" button (disabled)
- [ ] After end: "Voting Closed" message
- [ ] Cannot vote outside active period

## 5. Real-Time Updates Testing

### 5.1 Live Vote Updates

**Test Steps:**
1. Open results page on one browser
2. Vote on another browser
3. Watch for real-time update
4. Check vote count increases instantly

**Expected Results:**
- [ ] Results update within 1-2 seconds
- [ ] No page refresh needed
- [ ] Charts update live

### 5.2 Live Results

**Test Steps:**
1. Multiple users vote simultaneously
2. Results page shows updates
3. Check accuracy of counts

**Expected Results:**
- [ ] All votes counted correctly
- [ ] Results persist across page refreshes
- [ ] Percentages calculated correctly

## 6. Dashboard Testing

### 6.1 User Dashboard

**Test Steps:**
1. Navigate to dashboard
2. Check tabs: Joined Events, Voted Events, Available Events
3. Verify counts

**Expected Results:**
- [ ] Correct events in each tab
- [ ] Vote counts accurate
- [ ] No duplicate events
- [ ] Event status displays correctly

### 6.2 Admin Dashboard

**Test Steps:**
1. Login as admin
2. Check analytics cards:
   - Total Events
   - Active Events
   - Total Votes
   - Total Participants

**Expected Results:**
- [ ] All counts are accurate
- [ ] Update when changes occur
- [ ] Stats match event data

## 7. Results & Analytics Testing

### 7.1 View Results

**Test Steps:**
1. Navigate to event results page
2. Check bar chart and pie chart
3. Verify rankings

**Expected Results:**
- [ ] Charts render correctly
- [ ] Vote counts accurate
- [ ] Percentages calculated (100% total)
- [ ] Rankings by vote count

### 7.2 Winner Announcement

**Test Steps:**
1. Event ends
2. Check results page
3. Look for winner announcement

**Expected Results:**
- [ ] Winner displays with yellow highlight
- [ ] Winner name and vote count shown
- [ ] Correct winner selected

## 8. UI/UX Testing

### 8.1 Responsive Design

**Test Steps:**
1. Test on desktop (1920px+)
2. Test on tablet (768px)
3. Test on mobile (375px)
4. Resize browser window

**Expected Results:**
- [ ] All pages responsive
- [ ] Mobile menu works
- [ ] Touch-friendly buttons
- [ ] No horizontal scroll

### 8.2 Animations

**Test Steps:**
1. Navigate between pages
2. Open modals
3. Hover over buttons
4. Check animations

**Expected Results:**
- [ ] Smooth transitions
- [ ] No janky animations
- [ ] Performance acceptable
- [ ] Animations meaningful

### 8.3 Dark Theme

**Test Steps:**
1. Check overall appearance
2. Verify contrast for accessibility
3. Check text readability
4. Verify glass-morphism effects

**Expected Results:**
- [ ] Dark theme applies consistently
- [ ] Text is readable
- [ ] Buttons are clearly visible
- [ ] Modern aesthetic maintained

## 9. Error Handling Testing

### 9.1 Network Errors

**Test Steps:**
1. Stop backend server
2. Try any action (create event, vote, etc.)

**Expected Results:**
- [ ] Error toast notification appears
- [ ] User-friendly message shows
- [ ] App doesn't crash

### 9.2 Invalid Data

**Test Steps:**
1. Try entering invalid data:
   - Empty fields in forms
   - Invalid email format
   - Past dates for events
   - Negative numbers

**Expected Results:**
- [ ] Form validation catches errors
- [ ] Clear error messages
- [ ] Submit prevented

## 10. Database Testing

### 10.1 Data Persistence

**Test Steps:**
1. Create event
2. Close browser
3. Re-open site
4. Login again

**Expected Results:**
- [ ] Event still exists
- [ ] User data preserved
- [ ] Vote counts preserved

### 10.2 Database Constraints

**Test Steps:**
1. Check vote uniqueness:
   - One vote per user per event
2. Check cascading deletes:
   - Delete event → candidates deleted too

**Expected Results:**
- [ ] Constraints enforced
- [ ] Data integrity maintained

## 11. Security Testing

### 11.1 JWT Token

**Test Steps:**
1. Login
2. Check localStorage for token
3. Manually modify token in console
4. Try accessing protected routes

**Expected Results:**
- [ ] Token stored securely
- [ ] Modified token rejected
- [ ] Proper auth required

### 11.2 Password Hashing

**Test Steps:**
1. Check database for user
2. Verify password not stored as plain text
3. Password should be bcrypt hash

**Expected Results:**
- [ ] Password hashed
- [ ] Cannot read original password
- [ ] Same password produces different hash

### 11.3 CORS Protection

**Test Steps:**
1. Try API call from different origin
2. Check browser console

**Expected Results:**
- [ ] Cross-origin requests blocked
- [ ] CORS error in console
- [ ] Only allowed origins work

## 12. Performance Testing

### 12.1 Load Time

**Test Steps:**
1. Open DevTools Network tab
2. Navigate to different pages
3. Check load times

**Expected Results:**
- [ ] Landing page: < 2 seconds
- [ ] Dashboard: < 1.5 seconds
- [ ] Results page: < 1 second

### 12.2 Bundle Size

**Test Steps:**
1. Run: `npm run build` (frontend)
2. Check dist folder size

**Expected Results:**
- [ ] Main bundle < 200KB gzipped
- [ ] Total assets < 500KB

## 13. Browser Compatibility

**Test on:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Expected Results:**
- [ ] All features work
- [ ] No console errors
- [ ] Layout consistent

## 14. Accessibility Testing

### 14.1 Keyboard Navigation

**Test Steps:**
1. Use Tab key to navigate
2. Use Enter to submit forms
3. Use Escape to close modals

**Expected Results:**
- [ ] All elements reachable via keyboard
- [ ] Focus visible
- [ ] Logical tab order

### 14.2 Screen Reader

**Test Steps:**
1. Use screen reader (NVDA, JAWS, VoiceOver)
2. Navigate site
3. Listen to descriptions

**Expected Results:**
- [ ] All content readable
- [ ] Images have alt text
- [ ] Form labels clear

## Testing Checklist Summary

```
Authentication
├── [ ] Register
├── [ ] Login
├── [ ] Profile update
├── [ ] Logout
└── [ ] Password reset

Event Management
├── [ ] Create event
├── [ ] Edit event
├── [ ] Delete event
├── [ ] Add candidates
└── [ ] Remove candidates

User Features
├── [ ] Join event
├── [ ] Search events
├── [ ] View dashboard
└── [ ] Voting history

Voting
├── [ ] Cast vote
├── [ ] Prevent duplicates
├── [ ] Vote timing
└── [ ] Real-time updates

Results
├── [ ] View results
├── [ ] Charts display
├── [ ] Live updates
└── [ ] Winner announcement

UI/UX
├── [ ] Responsive design
├── [ ] Animations work
├── [ ] Dark theme
└── [ ] Error messages

Security
├── [ ] JWT validation
├── [ ] Password hashing
├── [ ] CORS protection
└── [ ] Input validation

Performance
├── [ ] Page load times
├── [ ] Bundle size
├── [ ] Real-time responsiveness
└── [ ] No memory leaks

Browser Support
├── [ ] Chrome
├── [ ] Firefox
├── [ ] Safari
└── [ ] Edge

Accessibility
├── [ ] Keyboard navigation
├── [ ] Screen reader
├── [ ] Contrast ratio
└── [ ] Form labels
```

## Reporting Bugs

When bugs are found:
1. Document exact steps to reproduce
2. Note browser and OS
3. Check console errors
4. Take screenshots
5. Create GitHub issue with details

## Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| API Response | < 200ms | ___ |
| Page Load | < 2s | ___ |
| Vote Submit | < 500ms | ___ |
| Results Update | < 2s | ___ |
| Bundle Size | < 500KB | ___ |
| Lighthouse Score | > 80 | ___ |

---

Use this guide to systematically test all features before deployment!
