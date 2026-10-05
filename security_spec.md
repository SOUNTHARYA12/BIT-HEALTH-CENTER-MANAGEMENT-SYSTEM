# Security Specification: BIT Student Health Center System

## 1. Data Invariants

1. **User Identity & Privacy Invariant**: A user document at `/users/{userId}` can only be read or written by the authenticated user whose `request.auth.uid == userId` or by a verified system Administrator (`isAdmin()`). Non-admin users cannot read other users' profile documents, phone numbers, or health details.
2. **Role Elevation Protection**: A non-admin user can NEVER alter their own `role` field in `/users/{userId}` or create documents in `/admins/{adminId}`.
3. **Appointment Student Integrity**: When an appointment is created at `/appointments/{appointmentId}`, the student roll number / owner ID must match the authenticated requester or be booked through clinic triage. An appointment status cannot be reverted from `completed` or `cancelled` back to `scheduled` except by an Administrator.
4. **Doctor Status Guard**: Doctor availability records at `/doctors/{doctorId}` can be read by all authenticated university members to see clinic hours, but can only be updated by the doctor themselves or by an Administrator.
5. **Medicine & Dispensary Authority**: Stock changes in `/medicines/{medicineId}` and audit entries in `/stock_logs/{logId}` can only be performed by users with verified pharmacist or administrator roles. Negative inventory values are rejected.
6. **Immutable Historical Records**: Audit logs in `/stock_logs/{logId}` are append-only. Updates and deletions are forbidden once logged.
7. **Document ID Sanitization**: All document IDs must conform to `^[a-zA-Z0-9_\-]+$` and have a maximum size of 128 characters.
8. **Admin Bootstrap Invariant**: The designated runtime admin email (`sountharyar.ad23@bitsathy.ac.in`) and the health administration email (`healthadmin@bitsathy.ac.in`) are permanently recognized as administrators, alongside any entries in the `/admins/` collection.

---

## 2. The "Dirty Dozen" Payloads (Adversarial Test Vectors)

1. **Dirty Payload 1 (Identity Spoofing - Impersonate Another User's Profile)**:
   - Target: `/users/USR-STU-02`
   - Requester UID: `USR-STU-01`
   - Payload: `{ "id": "USR-STU-02", "name": "Hacked Profile", "role": "student" }`
   - Expected Result: `PERMISSION_DENIED`

2. **Dirty Payload 2 (Privilege Escalation - Self-Promote to Admin)**:
   - Target: `/users/USR-STU-01`
   - Requester UID: `USR-STU-01`
   - Payload: `{ "role": "admin" }`
   - Expected Result: `PERMISSION_DENIED`

3. **Dirty Payload 3 (Unauthorized Admin Injection)**:
   - Target: `/admins/hacker-id`
   - Requester UID: `attacker-uid` (unverified student)
   - Payload: `{ "email": "attacker@evil.com", "role": "admin" }`
   - Expected Result: `PERMISSION_DENIED`

4. **Dirty Payload 4 (Read Privacy Breach - Non-Admin Reading Other Student's Vitals/PII)**:
   - Target: `GET /users/USR-STU-02`
   - Requester UID: `USR-STU-01` (Student)
   - Expected Result: `PERMISSION_DENIED`

5. **Dirty Payload 5 (ID Poisoning Attack)**:
   - Target: `/appointments/` + `A`.repeat(1500)
   - Requester UID: `USR-STU-01`
   - Payload: `{ "tokenNumber": "BIT-001", "studentName": "Test" }`
   - Expected Result: `PERMISSION_DENIED` (Exceeds 128-char limit and invalid ID)

6. **Dirty Payload 6 (Shadow Field Injection on User Update)**:
   - Target: `/users/USR-STU-01`
   - Requester UID: `USR-STU-01`
   - Payload: `{ "emergencyContact": "Dad", "isSuperAdmin": true, "verified": true }`
   - Expected Result: `PERMISSION_DENIED` (Ghost field disallowed)

7. **Dirty Payload 7 (Doctor Impersonation - Student Altering Doctor Status)**:
   - Target: `/doctors/DOC-101`
   - Requester UID: `USR-STU-01` (Student)
   - Payload: `{ "currentStatus": "offline" }`
   - Expected Result: `PERMISSION_DENIED`

8. **Dirty Payload 8 (Pharmacy Inventory Tampering by Student)**:
   - Target: `/medicines/MED-01`
   - Requester UID: `USR-STU-01` (Student)
   - Payload: `{ "stockQuantity": 99999 }`
   - Expected Result: `PERMISSION_DENIED`

9. **Dirty Payload 9 (Audit Log Deletion / Tampering)**:
   - Target: `DELETE /stock_logs/LOG-99`
   - Requester UID: `USR-PHARM-01` (Pharmacist)
   - Expected Result: `PERMISSION_DENIED` (Stock audit logs are immutable and permanent)

10. **Dirty Payload 10 (Negative Inventory Write)**:
    - Target: `/medicines/MED-02`
    - Requester UID: `USR-PHARM-01`
    - Payload: `{ "stockQuantity": -50 }`
    - Expected Result: `PERMISSION_DENIED` (Inventory quantities must be non-negative)

11. **Dirty Payload 11 (Terminal State Hijack on Appointment)**:
    - Target: `/appointments/APT-888` (Currently in `completed` status)
    - Requester UID: `USR-STU-01` (Student)
    - Payload: `{ "status": "scheduled" }`
    - Expected Result: `PERMISSION_DENIED` (Completed medical consultations cannot be rewritten by students)

12. **Dirty Payload 12 (Blanket User Query / Scraping by Non-Admin)**:
    - Target: `LIST /users`
    - Requester UID: `USR-STU-01` (Student)
    - Expected Result: `PERMISSION_DENIED` (Only Admin can list all user records)
