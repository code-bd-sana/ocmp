# Complete API List for Tim Tim Application

## Overview

This document contains **ALL** APIs required for the complete Tim Tim transport management system based on 34 schemas and business requirements.

---

## 1. Authentication & Authorization APIs

### Auth APIs

| Method | Endpoint                                 | Description                            | Access        |
| ------ | ---------------------------------------- | -------------------------------------- | ------------- |
| POST   | `/api/v1/auth/login`                     | Login user                             | Public        |
| POST   | `/api/v1/auth/logout`                    | Logout user                            | Authenticated |
| POST   | `/api/v1/auth/register`                  | Register a new user                    | Public        |
| PATCH  | `/api/v1/auth/verify-email`              | Verify email after registration        | Public        |
| POST   | `/api/v1/auth/resend-verification-email` | Resend verify email after registration | Public        |
| POST   | `/api/v1/auth/forgot-password`           | Request password reset                 | Public        |
| POST   | `/api/v1/auth/reset-password`            | Reset password with token              | Public        |
| POST   | `/api/v1/auth/change-password`           | Change password                        | Authenticated |

---

## 2. User Management APIs

### User CRUD

| Method | Endpoint                      | Description                         | Access                       |
| ------ | ----------------------------- | ----------------------------------- | ---------------------------- |
| GET    | `/api/v1/user`                | Get all users (paginated, filtered) | Admin/Transport Manager      |
| POST   | `/api/v1/user`                | Create new user(STAFF/OTHERS)       | Admin                        |
| PATCH  | `/api/v1/user/me`             | Update logged in user               | Self                         |
| Get    | `/api/v1/user/me`             | Get logged in user profile          | Self                         |
| GET    | `/api/v1/user/:userId`        | Get user by ID                      | Admin/Transport Manager/Self |
| PUT    | `/api/v1/user/:userId`        | Update user                         | Admin/Self                   |
| PATCH  | `/api/v1/user/:userId/status` | Activate/Deactivate user            | Admin                        |
| DELETE | `/api/v1/user/:userId`        | Delete user                         | Admin                        |

### Transport Manager - Client Management

| Method | Endpoint                                                 | Description                           | Access                  |
| ------ | -------------------------------------------------------- | ------------------------------------- | ----------------------- |
| POST   | `/api/v1/user/clients`                                   | Create client under Transport Manager | Transport Manager       |
| GET    | `/api/v1/user/transport-manager/:managerId/clients`      | Get all clients of Transport Manager  | Transport Manager/Admin |
| GET    | `/api/v1/user/clients/:clientId/manager`                 | Get Transport Manager of a client     | Client/Admin            |
| PUT    | `/api/v1/user/clients/:clientId/assign-manager`          | Assign client to Transport Manager    | Admin/Client            |
| DELETE | `/api/v1/user/clients/:clientId/remove-manager`          | Remove client from Transport Manager  | Admin/Client            |
| GET    | `/api/v1/user/transport-manager/:managerId/client-limit` | Check client limit status             | Transport Manager       |
| PUT    | `/api/v1/user/transport-manager/:managerId/client-limit` | Update client limit                   | Admin                   |

---

## 3. Repository Settings APIs

| Method | Endpoint                                     | Description                  | Access     |
| ------ | -------------------------------------------- | ---------------------------- | ---------- |
| GET    | `/api/v1/repository-setting/:userId`         | Get user repository settings | User/Admin |
| POST   | `/api/v1/repository-setting`                 | Create repository settings   | User       |
| PUT    | `/api/v1/repository-setting/:userId`         | Update repository settings   | User/Admin |
| PATCH  | `/api/v1/repository-setting/:userId/feature` | Toggle single feature        | User       |

---

## 4. Notification APIs

| Method | Endpoint                                         | Description            | Access       |
| ------ | ------------------------------------------------ | ---------------------- | ------------ |
| GET    | `/api/v1/notification`                           | Get all notifications  | Admin        |
| GET    | `/api/v1/notification/user/:userId`              | Get user notifications | User/Admin   |
| GET    | `/api/v1/notification/:notificationId`           | Get notification by ID | User/Admin   |
| POST   | `/api/v1/notification`                           | Create notification    | Admin/System |
| PATCH  | `/api/v1/notification/:notificationId/read`      | Mark as read           | User         |
| PATCH  | `/api/v1/notification/user/:userId/read-all`     | Mark all as read       | User         |
| DELETE | `/api/v1/notification/:notificationId`           | Delete notification    | User/Admin   |
| GET    | `/api/v1/notification/user/:userId/unread-count` | Get unread count       | User         |

---

## 5. Activity Log APIs

| Method | Endpoint                              | Description            | Access     |
| ------ | ------------------------------------- | ---------------------- | ---------- |
| GET    | `/api/v1/activity-log`                | Get all activity logs  | Admin      |
| GET    | `/api/v1/activity-log/user/:userId`   | Get user activity logs | User/Admin |
| GET    | `/api/v1/activity-log/:logId`         | Get log by ID          | Admin      |
| GET    | `/api/v1/activity-log/module/:module` | Get logs by module     | Admin      |
| GET    | `/api/v1/activity-log/action/:action` | Get logs by action     | Admin      |
| DELETE | `/api/v1/activity-log/cleanup`        | Clean old logs         | Admin      |

---

## 6. Login Activity APIs

| Method | Endpoint                               | Description               | Access     |
| ------ | -------------------------------------- | ------------------------- | ---------- |
| GET    | `/api/v1/login-activities`             | Get all login activities  | Admin      |
| GET    | `/api/v1/login-activities/user/:email` | Get user login history    | User/Admin |
| GET    | `/api/v1/login-activities/:activityId` | Get activity by ID        | Admin      |
| GET    | `/api/v1/login-activities/failed`      | Get failed login attempts | Admin      |
| GET    | `/api/v1/login-activities/suspicious`  | Get suspicious activities | Admin      |

---

## 7. Subscription Plan APIs

| Method | Endpoint                                              | Description               | Access |
| ------ | ----------------------------------------------------- | ------------------------- | ------ |
| GET    | `/api/v1/subscription-plan`                           | Get all plans             | Public |
| GET    | `/api/v1/subscription-plan/:planId`                   | Get plan by ID            | Public |
| POST   | `/api/v1/subscription-plan`                           | Create plan               | Admin  |
| PUT    | `/api/v1/subscription-plan/:planId`                   | Update plan               | Admin  |
| PATCH  | `/api/v1/subscription-plan/:planId/status`            | Activate/Deactivate plan  | Admin  |
| DELETE | `/api/v1/subscription-plan/:planId`                   | Delete plan               | Admin  |
| GET    | `/api/v1/subscription-plan/type/:planType`            | Get plans by type         | Public |
| GET    | `/api/v1/subscription-plan/account-type/:accountType` | Get plans by account type | Public |

---

## 8. Subscription Duration APIs

| Method | Endpoint                                           | Description         | Access |
| ------ | -------------------------------------------------- | ------------------- | ------ |
| GET    | `/api/v1/subscription-duration`                    | Get all durations   | Public |
| GET    | `/api/v1/subscription-duration/:durationId`        | Get duration by ID  | Public |
| POST   | `/api/v1/subscription-duration`                    | Create duration     | Admin  |
| PUT    | `/api/v1/subscription-duration/:durationId`        | Update duration     | Admin  |
| PATCH  | `/api/v1/subscription-duration/:durationId/status` | Activate/Deactivate | Admin  |
| DELETE | `/api/v1/subscription-duration/:durationId`        | Delete duration     | Admin  |

---

## 9. Subscription Pricing APIs

| Method | Endpoint                                                         | Description            | Access |
| ------ | ---------------------------------------------------------------- | ---------------------- | ------ |
| GET    | `/api/v1/subscription-pricing`                                   | Get all pricing(s)     | Public |
| GET    | `/api/v1/subscription-pricing/:pricingId`                        | Get pricing by ID      | Public |
| GET    | `/api/v1/subscription-pricing/plan/:planId`                      | Get pricing(s) by plan | Public |
| GET    | `/api/v1/subscription-pricing/plan/:planId/duration/:durationId` | Get specific price     | Public |
| POST   | `/api/v1/subscription-pricing`                                   | Create pricing         | Admin  |
| PUT    | `/api/v1/subscription-pricing/:pricingId`                        | Update pricing         | Admin  |
| PATCH  | `/api/v1/subscription-pricing/:pricingId/status`                 | Activate/Deactivate    | Admin  |
| DELETE | `/api/v1/subscription-pricing/:pricingId`                        | Delete pricing         | Admin  |

---

## 10. Subscription Feature APIs

| Method | Endpoint                                  | Description         | Access |
| ------ | ----------------------------------------- | ------------------- | ------ |
| GET    | `/api/v1/subscription-feature`            | Get all features    | Public |
| GET    | `/api/v1/subscription-feature/:featureId` | Get feature by ID   | Public |
| GET    | `/api/v1/subscription-feature/code/:code` | Get feature by code | Public |
| GET    | `/api/v1/subscription-feature/core`       | Get core features   | Public |
| POST   | `/api/v1/subscription-feature`            | Create feature      | Admin  |
| PUT    | `/api/v1/subscription-feature/:featureId` | Update feature      | Admin  |
| DELETE | `/api/v1/subscription-feature/:featureId` | Delete feature      | Admin  |

---

## 11. User Subscription APIs

| Method | Endpoint                                               | Description                    | Access     |
| ------ | ------------------------------------------------------ | ------------------------------ | ---------- |
| GET    | `/api/v1/user-subscription`                            | Get all subscriptions          | Admin      |
| GET    | `/api/v1/user-subscription/:subscriptionId`            | Get subscription by ID         | User/Admin |
| GET    | `/api/v1/user-subscription/user/:userId`               | Get user subscription          | User/Admin |
| POST   | `/api/v1/user-subscription`                            | Create subscription            | Admin/User |
| PUT    | `/api/v1/user-subscription/:subscriptionId`            | Update subscription            | Admin      |
| PATCH  | `/api/v1/user-subscription/:subscriptionId/status`     | Update status                  | Admin      |
| PATCH  | `/api/v1/user-subscription/:subscriptionId/renew`      | Renew subscription             | User/Admin |
| PATCH  | `/api/v1/user-subscription/:subscriptionId/cancel`     | Cancel subscription            | User/Admin |
| PATCH  | `/api/v1/user-subscription/:subscriptionId/auto-renew` | Toggle auto-renew              | User       |
| GET    | `/api/v1/user-subscription/user/:userId/active`        | Get active subscription        | User/Admin |
| GET    | `/api/v1/user-subscription/user/:userId/expiring`      | Check expiring soon            | User/Admin |
| GET    | `/api/v1/user-subscription/expiring`                   | Get all expiring subscriptions | Admin      |

---

## 12. Subscription Customization APIs

| Method | Endpoint                                                          | Description                 | Access     |
| ------ | ----------------------------------------------------------------- | --------------------------- | ---------- |
| GET    | `/api/v1/subscription-customization/subscription/:subscriptionId` | Get subscription features   | User/Admin |
| POST   | `/api/v1/subscription-customization`                              | Add feature to subscription | Admin/User |
| PATCH  | `/api/v1/subscription-customization/:customizationId`             | Toggle feature              | User/Admin |
| DELETE | `/api/v1/subscription-customization/:customizationId`             | Remove feature              | Admin      |
| GET    | `/api/v1/subscription-customization/:customizationId`             | Get customization by ID     | User/Admin |

---

## 13. Subscription Trial APIs

| Method | Endpoint                                           | Description             | Access      |
| ------ | -------------------------------------------------- | ----------------------- | ----------- |
| GET    | `/api/v1/subscription-trial`                       | Get all trials          | Admin       |
| GET    | `/api/v1/subscription-trial/user/:userId`          | Get user trial          | User/Admin  |
| POST   | `/api/v1/subscription-trial`                       | Start trial             | User/System |
| PATCH  | `/api/v1/subscription-trial/:trialId/convert`      | Convert to paid         | User/Admin  |
| GET    | `/api/v1/subscription-trial/user/:userId/eligible` | Check trial eligibility | User        |

---

## 14. Subscription Exemption APIs

| Method | Endpoint                                      | Description        | Access |
| ------ | --------------------------------------------- | ------------------ | ------ |
| GET    | `/api/v1/subscription-exemption`              | Get all exemptions | Admin  |
| GET    | `/api/v1/subscription-exemption/user/:userId` | Get user exemption | Admin  |
| POST   | `/api/v1/subscription-exemption`              | Create exemption   | Admin  |
| PUT    | `/api/v1/subscription-exemption/:exemptionId` | Update exemption   | Admin  |
| DELETE | `/api/v1/subscription-exemption/:exemptionId` | Remove exemption   | Admin  |

---

## 15. Subscription History APIs

| Method | Endpoint                                      | Description       | Access     |
| ------ | --------------------------------------------- | ----------------- | ---------- |
| GET    | `/api/v1/subscription-histories`              | Get all histories | Admin      |
| GET    | `/api/v1/subscription-histories/user/:userId` | Get user history  | User/Admin |
| GET    | `/api/v1/subscription-histories/:historyId`   | Get history by ID | User/Admin |

---

## 16. Subscription Invoice APIs

| Method | Endpoint                                                    | Description               | Access       |
| ------ | ----------------------------------------------------------- | ------------------------- | ------------ |
| GET    | `/api/v1/subscription-invoice`                              | Get all invoices          | Admin        |
| GET    | `/api/v1/subscription-invoice/:invoiceId`                   | Get invoice by ID         | User/Admin   |
| GET    | `/api/v1/subscription-invoice/user/:userId`                 | Get user invoices         | User/Admin   |
| GET    | `/api/v1/subscription-invoice/subscription/:subscriptionId` | Get subscription invoices | User/Admin   |
| POST   | `/api/v1/subscription-invoice`                              | Create invoice            | Admin/System |
| PUT    | `/api/v1/subscription-invoice/:invoiceId`                   | Update invoice            | Admin        |
| PATCH  | `/api/v1/subscription-invoice/:invoiceId/status`            | Update invoice status     | Admin/System |
| GET    | `/api/v1/subscription-invoice/:invoiceId/download`          | Download invoice PDF      | User/Admin   |
| GET    | `/api/v1/subscription-invoice/pending`                      | Get pending invoices      | Admin        |
| GET    | `/api/v1/subscription-invoice/overdue`                      | Get overdue invoices      | Admin        |

---

## 17. Subscription Payment APIs

| Method | Endpoint                                          | Description          | Access      |
| ------ | ------------------------------------------------- | -------------------- | ----------- |
| GET    | `/api/v1/subscription-payment`                    | Get all payments     | Admin       |
| GET    | `/api/v1/subscription-payment/:paymentId`         | Get payment by ID    | User/Admin  |
| GET    | `/api/v1/subscription-payment/invoice/:invoiceId` | Get invoice payments | User/Admin  |
| POST   | `/api/v1/subscription-payment`                    | Process payment      | User/System |
| POST   | `/api/v1/subscription-payment/:paymentId/retry`   | Retry failed payment | User/System |
| GET    | `/api/v1/subscription-payment/user/:userId`       | Get user payments    | User/Admin  |

---

## 18. Subscription Status Log APIs

| Method | Endpoint                                                       | Description           | Access     |
| ------ | -------------------------------------------------------------- | --------------------- | ---------- |
| GET    | `/api/v1/subscription-status-log`                              | Get all status logs   | Admin      |
| GET    | `/api/v1/subscription-status-log/subscription/:subscriptionId` | Get subscription logs | User/Admin |
| GET    | `/api/v1/subscription-status-log/:logId`                       | Get log by ID         | Admin      |

---

## 19. Subscription Usage Log APIs

| Method | Endpoint                                                      | Description             | Access     |
| ------ | ------------------------------------------------------------- | ----------------------- | ---------- |
| GET    | `/api/v1/subscription-usage-log`                              | Get all usage logs      | Admin      |
| GET    | `/api/v1/subscription-usage-log/subscription/:subscriptionId` | Get subscription usage  | User/Admin |
| GET    | `/api/v1/subscription-usage-log/:logId`                       | Get log by ID           | User/Admin |
| GET    | `/api/v1/subscription-usage-log/feature/:featureId`           | Get feature usage stats | Admin      |
| POST   | `/api/v1/subscription-usage-log`                              | Log feature usage       | System     |

---

## 20. Subscription Change Request APIs

| Method | Endpoint                                                 | Description           | Access     |
| ------ | -------------------------------------------------------- | --------------------- | ---------- |
| GET    | `/api/v1/subscription-change-request`                    | Get all requests      | Admin      |
| GET    | `/api/v1/subscription-change-request/:requestId`         | Get request by ID     | User/Admin |
| GET    | `/api/v1/subscription-change-request/user/:userId`       | Get user requests     | User/Admin |
| POST   | `/api/v1/subscription-change-request`                    | Create change request | User       |
| PATCH  | `/api/v1/subscription-change-request/:requestId/approve` | Approve request       | Admin      |
| PATCH  | `/api/v1/subscription-change-request/:requestId/reject`  | Reject request        | Admin      |
| DELETE | `/api/v1/subscription-change-request/:requestId`         | Cancel request        | User/Admin |
| GET    | `/api/v1/subscription-change-request/pending`            | Get pending requests  | Admin      |

---

## 21. Subscription Refund APIs

| Method | Endpoint                                                            | Description              | Access       |
| ------ | ------------------------------------------------------------------- | ------------------------ | ------------ |
| GET    | `/api/v1/subscription-refund`                                       | Get all refunds          | Admin        |
| GET    | `/api/v1/subscription-refund/:refundId`                             | Get refund by ID         | User/Admin   |
| GET    | `/api/v1/subscription-refund/user/:userId`                          | Get user refunds         | User/Admin   |
| POST   | `/api/v1/subscription-refund`                                       | Request refund           | User         |
| PATCH  | `/api/v1/subscription-refund/:refundId/approve`                     | Approve refund           | Admin        |
| PATCH  | `/api/v1/subscription-refund/:refundId/reject`                      | Reject refund            | Admin        |
| PATCH  | `/api/v1/subscription-refund/:refundId/process`                     | Process refund           | Admin/System |
| GET    | `/api/v1/subscription-refund/pending`                               | Get pending refunds      | Admin        |
| GET    | `/api/v1/subscription-refund/subscription/:subscriptionId/eligible` | Check refund eligibility | User         |

---

## 22. Vehicle Management APIs

| Method | Endpoint                                             | Description                          | Access                 |
| ------ | ---------------------------------------------------- | ------------------------------------ | ---------------------- |
| GET    | `/api/v1/vehicle`                                    | Get all vehicles                     | User                   |
| GET    | `/api/v1/vehicle/:vehicleId`                         | Get vehicle by ID                    | User                   |
| GET    | `/api/v1/vehicle/client/:clientId`                   | Get client vehicles                  | User/Transport Manager |
| GET    | `/api/v1/vehicle/driver/:driverId`                   | Get vehicle by driver                | User                   |
| GET    | `/api/v1/vehicle/license-plate/:plate`               | Get vehicle by plate                 | User                   |
| GET    | `/api/v1/vehicle/status/:status`                     | Get vehicles by status               | User                   |
| POST   | `/api/v1/vehicle`                                    | Create vehicle                       | User                   |
| PUT    | `/api/v1/vehicle/:vehicleId`                         | Update vehicle                       | User/Admin             |
| PATCH  | `/api/v1/vehicle/:vehicleId/status`                  | Update vehicle status                | User/Admin             |
| DELETE | `/api/v1/vehicle/:vehicleId`                         | Delete vehicle                       | User/Admin             |
| POST   | `/api/v1/vehicle/:vehicleId/attachments`             | Add attachments                      | User                   |
| DELETE | `/api/v1/vehicle/:vehicleId/attachments/:documentId` | Remove attachment                    | User                   |
| GET    | `/api/v1/vehicle/expiring-insurance`                 | Get vehicles with expiring insurance | User                   |
| GET    | `/api/v1/vehicle/expiring-ved`                       | Get vehicles with expiring VED       | User                   |
| GET    | `/api/v1/vehicle/due-service`                        | Get vehicles due for service         | User                   |

---

## 23. Driver Management APIs

| Method | Endpoint                                           | Description                       | Access                 |
| ------ | -------------------------------------------------- | --------------------------------- | ---------------------- |
| GET    | `/api/v1/driver`                                   | Get all drivers                   | User                   |
| GET    | `/api/v1/driver/:driverId`                         | Get driver by ID                  | User                   |
| GET    | `/api/v1/driver/employer/:employerId`              | Get employer's drivers            | User/Transport Manager |
| GET    | `/api/v1/driver/license/:licenseNumber`            | Get driver by license             | User                   |
| GET    | `/api/v1/driver/employed`                          | Get employed drivers              | User                   |
| GET    | `/api/v1/driver/unemployed`                        | Get unemployed drivers            | User                   |
| POST   | `/api/v1/driver`                                   | Create driver                     | User                   |
| PUT    | `/api/v1/driver/:driverId`                         | Update driver                     | User/Admin             |
| PATCH  | `/api/v1/driver/:driverId/employment`              | Update employment status          | User/Admin             |
| DELETE | `/api/v1/driver/:driverId`                         | Delete driver                     | User/Admin             |
| POST   | `/api/v1/driver/:driverId/attachments`             | Add attachments                   | User                   |
| DELETE | `/api/v1/driver/:driverId/attachments/:documentId` | Remove attachment                 | User                   |
| GET    | `/api/v1/driver/expiring-license`                  | Get drivers with expiring license | User                   |
| GET    | `/api/v1/driver/expiring-cpc`                      | Get drivers with expiring CPC     | User                   |
| GET    | `/api/v1/driver/checks-due`                        | Get drivers with checks due       | User                   |
| POST   | `/api/v1/driver/:driverId/check`                   | Record driver check               | User                   |

---

## 24. Driver Tachograph APIs

| Method | Endpoint                                       | Description                | Access     |
| ------ | ---------------------------------------------- | -------------------------- | ---------- |
| GET    | `/api/v1/driver-tachograph`                    | Get all tachograph records | User       |
| GET    | `/api/v1/driver-tachograph/:tachographId`      | Get record by ID           | User       |
| GET    | `/api/v1/driver-tachograph/driver/:driverId`   | Get driver records         | User       |
| GET    | `/api/v1/driver-tachograph/vehicle/:vehicleId` | Get vehicle records        | User       |
| POST   | `/api/v1/driver-tachograph`                    | Create tachograph record   | User       |
| PUT    | `/api/v1/driver-tachograph/:tachographId`      | Update record              | User/Admin |
| PATCH  | `/api/v1/driver-tachograph/:tachographId/sign` | Sign record                | User       |
| DELETE | `/api/v1/driver-tachograph/:tachographId`      | Delete record              | Admin      |
| GET    | `/api/v1/driver-tachograph/infringements`      | Get all infringements      | User       |
| GET    | `/api/v1/driver-tachograph/unsigned`           | Get unsigned records       | User       |

---

## 25. Fuel Usage APIs

| Method | Endpoint                                      | Description                  | Access     |
| ------ | --------------------------------------------- | ---------------------------- | ---------- |
| GET    | `/api/v1/fuel-usage`                          | Get all fuel records         | User       |
| GET    | `/api/v1/fuel-usage/:fuelUsageId`             | Get record by ID             | User       |
| GET    | `/api/v1/fuel-usage/vehicle/:vehicleId`       | Get vehicle fuel usage       | User       |
| GET    | `/api/v1/fuel-usage/driver/:driverId`         | Get driver fuel usage        | User       |
| POST   | `/api/v1/fuel-usage`                          | Create fuel record           | User       |
| PUT    | `/api/v1/fuel-usage/:fuelUsageId`             | Update fuel record           | User/Admin |
| DELETE | `/api/v1/fuel-usage/:fuelUsageId`             | Delete fuel record           | User/Admin |
| GET    | `/api/v1/fuel-usage/vehicle/:vehicleId/stats` | Get vehicle fuel statistics  | User       |
| GET    | `/api/v1/fuel-usage/driver/:driverId/stats`   | Get driver fuel statistics   | User       |
| GET    | `/api/v1/fuel-usage/date-range`               | Get fuel usage by date range | User       |

---

## 26. Subcontractor APIs

| Method | Endpoint                                   | Description               | Access     |
| ------ | ------------------------------------------ | ------------------------- | ---------- |
| GET    | `/api/v1/subcontractor`                    | Get all subcontractors    | User       |
| GET    | `/api/v1/subcontractor/:subcontractorId`   | Get subcontractor by ID   | User       |
| GET    | `/api/v1/subcontractor/creator/:creatorId` | Get user's subcontractors | User       |
| POST   | `/api/v1/subcontractor`                    | Create subcontractor      | User       |
| PUT    | `/api/v1/subcontractor/:subcontractorId`   | Update subcontractor      | User/Admin |
| DELETE | `/api/v1/subcontractor/:subcontractorId`   | Delete subcontractor      | User/Admin |
| GET    | `/api/v1/subcontractor/expiring-insurance` | Get expiring insurance    | User       |
| GET    | `/api/v1/subcontractor/expiring-git`       | Get expiring GIT          | User       |
| GET    | `/api/v1/subcontractor/rating/:minRating`  | Get by minimum rating     | User       |

---

## 27. Spot Check APIs

| Method | Endpoint                                      | Description                | Access     |
| ------ | --------------------------------------------- | -------------------------- | ---------- |
| GET    | `/api/v1/spot-check`                          | Get all spot checks        | User       |
| GET    | `/api/v1/spot-check/:spotCheckId`             | Get spot check by ID       | User       |
| GET    | `/api/v1/spot-check/vehicle/:vehicleId`       | Get vehicle spot checks    | User       |
| POST   | `/api/v1/spot-check`                          | Create spot check          | User       |
| PUT    | `/api/v1/spot-check/:spotCheckId`             | Update spot check          | User/Admin |
| PATCH  | `/api/v1/spot-check/:spotCheckId/complete`    | Mark as completed          | User       |
| DELETE | `/api/v1/spot-check/:spotCheckId`             | Delete spot check          | User/Admin |
| POST   | `/api/v1/spot-check/:spotCheckId/attachments` | Add attachments            | User       |
| GET    | `/api/v1/spot-check/pending`                  | Get pending spot checks    | User       |
| GET    | `/api/v1/spot-check/overdue`                  | Get overdue rectifications | User       |

---

## 28. PG9 & PG13 Plan APIs

| Method | Endpoint                                   | Description                 | Access     |
| ------ | ------------------------------------------ | --------------------------- | ---------- |
| GET    | `/api/v1/pg9-pg13-plan`                    | Get all plans               | User       |
| GET    | `/api/v1/pg9-pg13-plan/:planId`            | Get plan by ID              | User       |
| GET    | `/api/v1/pg9-pg13-plan/vehicle/:vehicleId` | Get vehicle plans           | User       |
| GET    | `/api/v1/pg9-pg13-plan/type/:issueType`    | Get by issue type           | User       |
| POST   | `/api/v1/pg9-pg13-plan`                    | Create plan                 | User       |
| PUT    | `/api/v1/pg9-pg13-plan/:planId`            | Update plan                 | User/Admin |
| PATCH  | `/api/v1/pg9-pg13-plan/:planId/clearance`  | Update clearance status     | User/Admin |
| DELETE | `/api/v1/pg9-pg13-plan/:planId`            | Delete plan                 | User/Admin |
| GET    | `/api/v1/pg9-pg13-plan/pending`            | Get pending clearances      | User       |
| GET    | `/api/v1/pg9-pg13-plan/follow-up`          | Get plans needing follow-up | User       |

---

## 29. ORS Plan APIs

| Method | Endpoint                                         | Description       | Access     |
| ------ | ------------------------------------------------ | ----------------- | ---------- |
| GET    | `/api/v1/ors-plan`                               | Get all ORS plans | User       |
| GET    | `/api/v1/ors-plan/:planId`                       | Get plan by ID    | User       |
| POST   | `/api/v1/ors-plan`                               | Create ORS plan   | User       |
| PUT    | `/api/v1/ors-plan/:planId`                       | Update ORS plan   | User/Admin |
| DELETE | `/api/v1/ors-plan/:planId`                       | Delete ORS plan   | User/Admin |
| POST   | `/api/v1/ors-plan/:planId/documents`             | Add documents     | User       |
| DELETE | `/api/v1/ors-plan/:planId/documents/:documentId` | Remove document   | User       |

---

## 30. Traffic Commissioner Communication APIs

| Method | Endpoint                                                                  | Description            | Access     |
| ------ | ------------------------------------------------------------------------- | ---------------------- | ---------- |
| GET    | `/api/v1/traffic-commissioner-communication`                              | Get all communications | User       |
| GET    | `/api/v1/traffic-commissioner-communication/:communicationId`             | Get by ID              | User       |
| GET    | `/api/v1/traffic-commissioner-communication/type/:type`                   | Get by type            | User       |
| POST   | `/api/v1/traffic-commissioner-communication`                              | Create communication   | User       |
| PUT    | `/api/v1/traffic-commissioner-communication/:communicationId`             | Update communication   | User/Admin |
| DELETE | `/api/v1/traffic-commissioner-communication/:communicationId`             | Delete communication   | User/Admin |
| POST   | `/api/v1/traffic-commissioner-communication/:communicationId/attachments` | Add attachments        | User       |

---

## 31. Renewal Tracker APIs

| Method | Endpoint                                      | Description           | Access     |
| ------ | --------------------------------------------- | --------------------- | ---------- |
| GET    | `/api/v1/renewal-tracker`                     | Get all renewals      | User       |
| GET    | `/api/v1/renewal-tracker/:renewalId`          | Get renewal by ID     | User       |
| GET    | `/api/v1/renewal-tracker/type/:type`          | Get by type           | User       |
| POST   | `/api/v1/renewal-tracker`                     | Create renewal item   | User       |
| PUT    | `/api/v1/renewal-tracker/:renewalId`          | Update renewal        | User/Admin |
| DELETE | `/api/v1/renewal-tracker/:renewalId`          | Delete renewal        | User/Admin |
| GET    | `/api/v1/renewal-tracker/expiring`            | Get expiring renewals | User       |
| GET    | `/api/v1/renewal-tracker/expired`             | Get expired renewals  | User       |
| PATCH  | `/api/v1/renewal-tracker/:renewalId/reminder` | Set/Update reminder   | User       |
| PATCH  | `/api/v1/renewal-tracker/:renewalId/status`   | Update status         | User       |

---

## 32. Audit & Rectification Report APIs

| Method | Endpoint                                                    | Description      | Access     |
| ------ | ----------------------------------------------------------- | ---------------- | ---------- |
| GET    | `/api/v1/audits-rectification-report`                       | Get all reports  | User       |
| GET    | `/api/v1/audits-rectification-report/:reportId`             | Get report by ID | User       |
| GET    | `/api/v1/audits-rectification-report/type/:type`            | Get by type      | User       |
| POST   | `/api/v1/audits-rectification-report`                       | Create report    | User       |
| PUT    | `/api/v1/audits-rectification-report/:reportId`             | Update report    | User/Admin |
| DELETE | `/api/v1/audits-rectification-report/:reportId`             | Delete report    | User/Admin |
| POST   | `/api/v1/audits-rectification-report/:reportId/attachments` | Add attachments  | User       |

---

## 33. Wheel Retorque Policy Monitoring APIs

| Method | Endpoint                                                   | Description           | Access     |
| ------ | ---------------------------------------------------------- | --------------------- | ---------- |
| GET    | `/api/v1/wheel-retorque-monitoring`                        | Get all records       | User       |
| GET    | `/api/v1/wheel-retorque-monitoring/:monitoringId`          | Get record by ID      | User       |
| GET    | `/api/v1/wheel-retorque-monitoring/vehicle/:vehicleId`     | Get vehicle records   | User       |
| POST   | `/api/v1/wheel-retorque-monitoring`                        | Create record         | User       |
| PUT    | `/api/v1/wheel-retorque-monitoring/:monitoringId`          | Update record         | User/Admin |
| PATCH  | `/api/v1/wheel-retorque-monitoring/:monitoringId/complete` | Mark completed        | User       |
| DELETE | `/api/v1/wheel-retorque-monitoring/:monitoringId`          | Delete record         | User/Admin |
| GET    | `/api/v1/wheel-retorque-monitoring/due`                    | Get due retorques     | User       |
| GET    | `/api/v1/wheel-retorque-monitoring/overdue`                | Get overdue retorques | User       |

---

## 34. Compliance Timetable APIs

| Method | Endpoint                                      | Description        | Access     |
| ------ | --------------------------------------------- | ------------------ | ---------- |
| GET    | `/api/v1/compliance-timetable`                | Get all tasks      | User       |
| GET    | `/api/v1/compliance-timetable/:taskId`        | Get task by ID     | User       |
| GET    | `/api/v1/compliance-timetable/status/:status` | Get by status      | User       |
| POST   | `/api/v1/compliance-timetable`                | Create task        | User       |
| PUT    | `/api/v1/compliance-timetable/:taskId`        | Update task        | User/Admin |
| PATCH  | `/api/v1/compliance-timetable/:taskId/status` | Update status      | User       |
| DELETE | `/api/v1/compliance-timetable/:taskId`        | Delete task        | User/Admin |
| GET    | `/api/v1/compliance-timetable/upcoming`       | Get upcoming tasks | User       |
| GET    | `/api/v1/compliance-timetable/overdue`        | Get overdue tasks  | User       |

---

## 35. Dashboard & Analytics APIs

| Method | Endpoint                                | Description            | Access     |
| ------ | --------------------------------------- | ---------------------- | ---------- |
| GET    | `/api/v1/dashboard/overview`            | Get dashboard overview | User       |
| GET    | `/api/v1/dashboard/stats`               | Get statistics         | User       |
| GET    | `/api/v1/dashboard/vehicle/summary`     | Vehicle summary        | User       |
| GET    | `/api/v1/dashboard/driver/summary`      | Driver summary         | User       |
| GET    | `/api/v1/dashboard/compliance/summary`  | Compliance summary     | User       |
| GET    | `/api/v1/dashboard/subscription/status` | Subscription status    | User       |
| GET    | `/api/v1/dashboard/alerts`              | Get all alerts         | User       |
| GET    | `/api/v1/dashboard/upcoming-tasks`      | Get upcoming tasks     | User       |
| GET    | `/api/v1/dashboard/financial-overview`  | Financial overview     | User/Admin |

---

## 36. Reports & Export APIs

| Method | Endpoint                             | Description                | Access     |
| ------ | ------------------------------------ | -------------------------- | ---------- |
| POST   | `/api/v1/reports/vehicle`            | Generate vehicle report    | User       |
| POST   | `/api/v1/reports/driver`             | Generate driver report     | User       |
| POST   | `/api/v1/reports/fuel-usage`         | Generate fuel report       | User       |
| POST   | `/api/v1/reports/compliance`         | Generate compliance report | User       |
| POST   | `/api/v1/reports/financial`          | Generate financial report  | User/Admin |
| POST   | `/api/v1/reports/subscription-usage` | Generate usage report      | Admin      |
| GET    | `/api/v1/reports/:reportId/download` | Download report            | User       |
| GET    | `/api/v1/reports/history`            | Get report history         | User       |
| POST   | `/api/v1/exports/vehicle`            | Export vehicles CSV/Excel  | User       |
| POST   | `/api/v1/exports/driver`             | Export drivers CSV/Excel   | User       |
| POST   | `/api/v1/exports/invoice`            | Export invoices CSV/Excel  | User       |

---

## 37. Admin Management APIs

| Method | Endpoint                                            | Description                 | Access |
| ------ | --------------------------------------------------- | --------------------------- | ------ |
| GET    | `/api/v1/admin/user`                                | Get all users with filters  | Admin  |
| GET    | `/api/v1/admin/subscription`                        | Manage all subscriptions    | Admin  |
| POST   | `/api/v1/admin/subscription/assign`                 | Assign subscription to user | Admin  |
| PATCH  | `/api/v1/admin/subscription/:subscriptionId/extend` | Extend subscription         | Admin  |
| GET    | `/api/v1/admin/revenue`                             | Get revenue statistics      | Admin  |
| GET    | `/api/v1/admin/system-health`                       | System health check         | Admin  |
| GET    | `/api/v1/admin/logs`                                | Get system logs             | Admin  |
| POST   | `/api/v1/admin/broadcast-notification`              | Send notification to all    | Admin  |

---

## 38. Subscription Request & Approval APIs (NEW)

| Method | Endpoint                                          | Description          | Access     |
| ------ | ------------------------------------------------- | -------------------- | ---------- |
| POST   | `/api/v1/subscription-request`                    | Request subscription | User       |
| GET    | `/api/v1/subscription-request`                    | Get all requests     | Admin      |
| GET    | `/api/v1/subscription-request/:requestId`         | Get request by ID    | User/Admin |
| GET    | `/api/v1/subscription-request/user/:userId`       | Get user requests    | User/Admin |
| GET    | `/api/v1/subscription-request/pending`            | Get pending requests | Admin      |
| PATCH  | `/api/v1/subscription-request/:requestId/approve` | Approve request      | Admin      |
| PATCH  | `/api/v1/subscription-request/:requestId/reject`  | Reject request       | Admin      |
| PUT    | `/api/v1/subscription-request/:requestId`         | Update request       | User       |
| DELETE | `/api/v1/subscription-request/:requestId`         | Cancel request       | User       |

---

## 39. Transport Manager - Client Limit APIs (NEW)

| Method | Endpoint                                                  | Description              | Access        |
| ------ | --------------------------------------------------------- | ------------------------ | ------------- |
| GET    | `/api/v1/transport-manager/:managerId/client-count`       | Get current client count | Manager/Admin |
| GET    | `/api/v1/transport-manager/:managerId/available-slots`    | Get available slots      | Manager       |
| POST   | `/api/v1/transport-manager/:managerId/client-request`     | Request to add client    | Manager       |
| DELETE | `/api/v1/transport-manager/:managerId/clients/:clientId`  | Remove client            | Manager/Admin |
| GET    | `/api/v1/transport-manager/:managerId/clients-near-limit` | Check near limit         | Manager       |

---

## Summary Statistics

### Total API Endpoints: **Around 200**

### Breakdown by Category:

- **Authentication**: 8 endpoints
- **User Management**: 8 endpoints
- **Repository Settings**: 4 endpoints
- **Notifications**: 8 endpoints
- **Activity Logs**: 6 endpoints
- **Login Activities**: 5 endpoints
- **Subscription Plans**: 8 endpoints
- **Subscription Durations**: 6 endpoints
- **Subscription Pricing**: 8 endpoints
- **Subscription Features**: 7 endpoints
- **User Subscriptions**: 12 endpoints
- **Subscription Customizations**: 5 endpoints
- **Subscription Trials**: 5 endpoints
- **Subscription Exemptions**: 5 endpoints
- **Subscription History**: 3 endpoints
- **Subscription Invoices**: 10 endpoints
- **Subscription Payments**: 6 endpoints
- **Subscription Status Logs**: 3 endpoints
- **Subscription Usage Logs**: 5 endpoints
- **Subscription Change Requests**: 8 endpoints
- **Subscription Refunds**: 9 endpoints
- **Vehicle Management**: 15 endpoints
- **Driver Management**: 16 endpoints
- **Driver Tachographs**: 10 endpoints
- **Fuel Usage**: 10 endpoints
- **Subcontractors**: 9 endpoints
- **Spot Checks**: 10 endpoints
- **PG9/PG13 Plans**: 10 endpoints
- **ORS Plans**: 7 endpoints
- **Traffic Commissioner**: 7 endpoints
- **Renewal Trackers**: 10 endpoints
- **Audit Reports**: 7 endpoints
- **Wheel Retorque**: 9 endpoints
- **Compliance Timetable**: 9 endpoints
- **Dashboard**: 9 endpoints
- **Reports & Export**: 11 endpoints
- **Admin Management**: 8 endpoints
- **Subscription Requests**: 9 endpoints
- **Manager Client Limits**: 5 endpoints

---
