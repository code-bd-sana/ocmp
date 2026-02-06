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

| Method | Endpoint                       | Description                         | Access                       |
| ------ | ------------------------------ | ----------------------------------- | ---------------------------- |
| GET    | `/api/v1/users`                | Get all users (paginated, filtered) | Admin/Transport Manager      |
| POST   | `/api/v1/users`                | Create new user(STAFF)              | Admin                        |
| PATCH  | `/api/v1/users/me`             | Update logged in user               | Self                         |
| Get    | `/api/v1/users/me`             | Get logged in user profile          | Self                         |
| GET    | `/api/v1/users/:userId`        | Get user by ID                      | Admin/Transport Manager/Self |
| PUT    | `/api/v1/users/:userId`        | Update user                         | Admin/Self                   |
| PATCH  | `/api/v1/users/:userId/status` | Activate/Deactivate user            | Admin                        |
| DELETE | `/api/v1/users/:userId`        | Delete user                         | Admin                        |

### Transport Manager - Client Management

| Method | Endpoint                                                  | Description                           | Access                  |
| ------ | --------------------------------------------------------- | ------------------------------------- | ----------------------- |
| POST   | `/api/v1/users/clients`                                   | Create client under Transport Manager | Transport Manager       |
| GET    | `/api/v1/users/transport-manager/:managerId/clients`      | Get all clients of Transport Manager  | Transport Manager/Admin |
| GET    | `/api/v1/users/clients/:clientId/manager`                 | Get Transport Manager of a client     | Client/Admin            |
| PUT    | `/api/v1/users/clients/:clientId/assign-manager`          | Assign client to Transport Manager    | Admin/Client            |
| DELETE | `/api/v1/users/clients/:clientId/remove-manager`          | Remove client from Transport Manager  | Admin/Client            |
| GET    | `/api/v1/users/transport-manager/:managerId/client-limit` | Check client limit status             | Transport Manager       |
| PUT    | `/api/v1/users/transport-manager/:managerId/client-limit` | Update client limit                   | Admin                   |

---

## 3. Repository Settings APIs

| Method | Endpoint                                      | Description                  | Access     |
| ------ | --------------------------------------------- | ---------------------------- | ---------- |
| GET    | `/api/v1/repository-settings/:userId`         | Get user repository settings | User/Admin |
| POST   | `/api/v1/repository-settings`                 | Create repository settings   | User       |
| PUT    | `/api/v1/repository-settings/:userId`         | Update repository settings   | User/Admin |
| PATCH  | `/api/v1/repository-settings/:userId/feature` | Toggle single feature        | User       |

---

## 4. Notification APIs

| Method | Endpoint                                          | Description            | Access       |
| ------ | ------------------------------------------------- | ---------------------- | ------------ |
| GET    | `/api/v1/notifications`                           | Get all notifications  | Admin        |
| GET    | `/api/v1/notifications/user/:userId`              | Get user notifications | User/Admin   |
| GET    | `/api/v1/notifications/:notificationId`           | Get notification by ID | User/Admin   |
| POST   | `/api/v1/notifications`                           | Create notification    | Admin/System |
| PATCH  | `/api/v1/notifications/:notificationId/read`      | Mark as read           | User         |
| PATCH  | `/api/v1/notifications/user/:userId/read-all`     | Mark all as read       | User         |
| DELETE | `/api/v1/notifications/:notificationId`           | Delete notification    | User/Admin   |
| GET    | `/api/v1/notifications/user/:userId/unread-count` | Get unread count       | User         |

---

## 5. Activity Log APIs

| Method | Endpoint                               | Description            | Access     |
| ------ | -------------------------------------- | ---------------------- | ---------- |
| GET    | `/api/v1/activity-logs`                | Get all activity logs  | Admin      |
| GET    | `/api/v1/activity-logs/user/:userId`   | Get user activity logs | User/Admin |
| GET    | `/api/v1/activity-logs/:logId`         | Get log by ID          | Admin      |
| GET    | `/api/v1/activity-logs/module/:module` | Get logs by module     | Admin      |
| GET    | `/api/v1/activity-logs/action/:action` | Get logs by action     | Admin      |
| DELETE | `/api/v1/activity-logs/cleanup`        | Clean old logs         | Admin      |

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

## 7. Document Management APIs

| Method | Endpoint                                 | Description               | Access         |
| ------ | ---------------------------------------- | ------------------------- | -------------- |
| GET    | `/api/v1/documents`                      | Get all documents         | User           |
| GET    | `/api/v1/documents/:documentId`          | Get document by ID        | User           |
| POST   | `/api/v1/documents/upload`               | Upload document           | User           |
| POST   | `/api/v1/documents/bulk-upload`          | Upload multiple documents | User           |
| PUT    | `/api/v1/documents/:documentId`          | Update document metadata  | Uploader/Admin |
| DELETE | `/api/v1/documents/:documentId`          | Delete document           | Uploader/Admin |
| GET    | `/api/v1/documents/uploader/:uploaderId` | Get documents by uploader | User           |
| GET    | `/api/v1/documents/download/:documentId` | Download document         | User           |

---

## 8. Subscription Plan APIs

| Method | Endpoint                                               | Description               | Access |
| ------ | ------------------------------------------------------ | ------------------------- | ------ |
| GET    | `/api/v1/subscription-plans`                           | Get all plans             | Public |
| GET    | `/api/v1/subscription-plans/:planId`                   | Get plan by ID            | Public |
| POST   | `/api/v1/subscription-plans`                           | Create plan               | Admin  |
| PUT    | `/api/v1/subscription-plans/:planId`                   | Update plan               | Admin  |
| PATCH  | `/api/v1/subscription-plans/:planId/status`            | Activate/Deactivate plan  | Admin  |
| DELETE | `/api/v1/subscription-plans/:planId`                   | Delete plan               | Admin  |
| GET    | `/api/v1/subscription-plans/type/:planType`            | Get plans by type         | Public |
| GET    | `/api/v1/subscription-plans/account-type/:accountType` | Get plans by account type | Public |

---

## 9. Subscription Duration APIs

| Method | Endpoint                                            | Description         | Access |
| ------ | --------------------------------------------------- | ------------------- | ------ |
| GET    | `/api/v1/subscription-durations`                    | Get all durations   | Public |
| GET    | `/api/v1/subscription-durations/:durationId`        | Get duration by ID  | Public |
| POST   | `/api/v1/subscription-durations`                    | Create duration     | Admin  |
| PUT    | `/api/v1/subscription-durations/:durationId`        | Update duration     | Admin  |
| PATCH  | `/api/v1/subscription-durations/:durationId/status` | Activate/Deactivate | Admin  |
| DELETE | `/api/v1/subscription-durations/:durationId`        | Delete duration     | Admin  |

---

## 10. Subscription Pricing APIs

| Method | Endpoint                                                          | Description          | Access |
| ------ | ----------------------------------------------------------------- | -------------------- | ------ |
| GET    | `/api/v1/subscription-pricings`                                   | Get all pricings     | Public |
| GET    | `/api/v1/subscription-pricings/:pricingId`                        | Get pricing by ID    | Public |
| GET    | `/api/v1/subscription-pricings/plan/:planId`                      | Get pricings by plan | Public |
| GET    | `/api/v1/subscription-pricings/plan/:planId/duration/:durationId` | Get specific price   | Public |
| POST   | `/api/v1/subscription-pricings`                                   | Create pricing       | Admin  |
| PUT    | `/api/v1/subscription-pricings/:pricingId`                        | Update pricing       | Admin  |
| PATCH  | `/api/v1/subscription-pricings/:pricingId/status`                 | Activate/Deactivate  | Admin  |
| DELETE | `/api/v1/subscription-pricings/:pricingId`                        | Delete pricing       | Admin  |

---

## 11. Subscription Feature APIs

| Method | Endpoint                                   | Description         | Access |
| ------ | ------------------------------------------ | ------------------- | ------ |
| GET    | `/api/v1/subscription-features`            | Get all features    | Public |
| GET    | `/api/v1/subscription-features/:featureId` | Get feature by ID   | Public |
| GET    | `/api/v1/subscription-features/code/:code` | Get feature by code | Public |
| GET    | `/api/v1/subscription-features/core`       | Get core features   | Public |
| POST   | `/api/v1/subscription-features`            | Create feature      | Admin  |
| PUT    | `/api/v1/subscription-features/:featureId` | Update feature      | Admin  |
| DELETE | `/api/v1/subscription-features/:featureId` | Delete feature      | Admin  |

---

## 12. User Subscription APIs

| Method | Endpoint                                                | Description                    | Access     |
| ------ | ------------------------------------------------------- | ------------------------------ | ---------- |
| GET    | `/api/v1/user-subscriptions`                            | Get all subscriptions          | Admin      |
| GET    | `/api/v1/user-subscriptions/:subscriptionId`            | Get subscription by ID         | User/Admin |
| GET    | `/api/v1/user-subscriptions/user/:userId`               | Get user subscription          | User/Admin |
| POST   | `/api/v1/user-subscriptions`                            | Create subscription            | Admin/User |
| PUT    | `/api/v1/user-subscriptions/:subscriptionId`            | Update subscription            | Admin      |
| PATCH  | `/api/v1/user-subscriptions/:subscriptionId/status`     | Update status                  | Admin      |
| PATCH  | `/api/v1/user-subscriptions/:subscriptionId/renew`      | Renew subscription             | User/Admin |
| PATCH  | `/api/v1/user-subscriptions/:subscriptionId/cancel`     | Cancel subscription            | User/Admin |
| PATCH  | `/api/v1/user-subscriptions/:subscriptionId/auto-renew` | Toggle auto-renew              | User       |
| GET    | `/api/v1/user-subscriptions/user/:userId/active`        | Get active subscription        | User/Admin |
| GET    | `/api/v1/user-subscriptions/user/:userId/expiring`      | Check expiring soon            | User/Admin |
| GET    | `/api/v1/user-subscriptions/expiring`                   | Get all expiring subscriptions | Admin      |

---

## 13. Subscription Customization APIs

| Method | Endpoint                                                           | Description                 | Access     |
| ------ | ------------------------------------------------------------------ | --------------------------- | ---------- |
| GET    | `/api/v1/subscription-customizations/subscription/:subscriptionId` | Get subscription features   | User/Admin |
| POST   | `/api/v1/subscription-customizations`                              | Add feature to subscription | Admin/User |
| PATCH  | `/api/v1/subscription-customizations/:customizationId`             | Toggle feature              | User/Admin |
| DELETE | `/api/v1/subscription-customizations/:customizationId`             | Remove feature              | Admin      |
| GET    | `/api/v1/subscription-customizations/:customizationId`             | Get customization by ID     | User/Admin |

---

## 14. Subscription Trial APIs

| Method | Endpoint                                            | Description             | Access      |
| ------ | --------------------------------------------------- | ----------------------- | ----------- |
| GET    | `/api/v1/subscription-trials`                       | Get all trials          | Admin       |
| GET    | `/api/v1/subscription-trials/user/:userId`          | Get user trial          | User/Admin  |
| POST   | `/api/v1/subscription-trials`                       | Start trial             | User/System |
| PATCH  | `/api/v1/subscription-trials/:trialId/convert`      | Convert to paid         | User/Admin  |
| GET    | `/api/v1/subscription-trials/user/:userId/eligible` | Check trial eligibility | User        |

---

## 15. Subscription Exemption APIs

| Method | Endpoint                                       | Description        | Access |
| ------ | ---------------------------------------------- | ------------------ | ------ |
| GET    | `/api/v1/subscription-exemptions`              | Get all exemptions | Admin  |
| GET    | `/api/v1/subscription-exemptions/user/:userId` | Get user exemption | Admin  |
| POST   | `/api/v1/subscription-exemptions`              | Create exemption   | Admin  |
| PUT    | `/api/v1/subscription-exemptions/:exemptionId` | Update exemption   | Admin  |
| DELETE | `/api/v1/subscription-exemptions/:exemptionId` | Remove exemption   | Admin  |

---

## 16. Subscription History APIs

| Method | Endpoint                                      | Description       | Access     |
| ------ | --------------------------------------------- | ----------------- | ---------- |
| GET    | `/api/v1/subscription-histories`              | Get all histories | Admin      |
| GET    | `/api/v1/subscription-histories/user/:userId` | Get user history  | User/Admin |
| GET    | `/api/v1/subscription-histories/:historyId`   | Get history by ID | User/Admin |

---

## 17. Subscription Invoice APIs

| Method | Endpoint                                                     | Description               | Access       |
| ------ | ------------------------------------------------------------ | ------------------------- | ------------ |
| GET    | `/api/v1/subscription-invoices`                              | Get all invoices          | Admin        |
| GET    | `/api/v1/subscription-invoices/:invoiceId`                   | Get invoice by ID         | User/Admin   |
| GET    | `/api/v1/subscription-invoices/user/:userId`                 | Get user invoices         | User/Admin   |
| GET    | `/api/v1/subscription-invoices/subscription/:subscriptionId` | Get subscription invoices | User/Admin   |
| POST   | `/api/v1/subscription-invoices`                              | Create invoice            | Admin/System |
| PUT    | `/api/v1/subscription-invoices/:invoiceId`                   | Update invoice            | Admin        |
| PATCH  | `/api/v1/subscription-invoices/:invoiceId/status`            | Update invoice status     | Admin/System |
| GET    | `/api/v1/subscription-invoices/:invoiceId/download`          | Download invoice PDF      | User/Admin   |
| GET    | `/api/v1/subscription-invoices/pending`                      | Get pending invoices      | Admin        |
| GET    | `/api/v1/subscription-invoices/overdue`                      | Get overdue invoices      | Admin        |

---

## 18. Subscription Payment APIs

| Method | Endpoint                                           | Description          | Access      |
| ------ | -------------------------------------------------- | -------------------- | ----------- |
| GET    | `/api/v1/subscription-payments`                    | Get all payments     | Admin       |
| GET    | `/api/v1/subscription-payments/:paymentId`         | Get payment by ID    | User/Admin  |
| GET    | `/api/v1/subscription-payments/invoice/:invoiceId` | Get invoice payments | User/Admin  |
| POST   | `/api/v1/subscription-payments`                    | Process payment      | User/System |
| POST   | `/api/v1/subscription-payments/:paymentId/retry`   | Retry failed payment | User/System |
| GET    | `/api/v1/subscription-payments/user/:userId`       | Get user payments    | User/Admin  |

---

## 19. Subscription Status Log APIs

| Method | Endpoint                                                        | Description           | Access     |
| ------ | --------------------------------------------------------------- | --------------------- | ---------- |
| GET    | `/api/v1/subscription-status-logs`                              | Get all status logs   | Admin      |
| GET    | `/api/v1/subscription-status-logs/subscription/:subscriptionId` | Get subscription logs | User/Admin |
| GET    | `/api/v1/subscription-status-logs/:logId`                       | Get log by ID         | Admin      |

---

## 20. Subscription Usage Log APIs

| Method | Endpoint                                                       | Description             | Access     |
| ------ | -------------------------------------------------------------- | ----------------------- | ---------- |
| GET    | `/api/v1/subscription-usage-logs`                              | Get all usage logs      | Admin      |
| GET    | `/api/v1/subscription-usage-logs/subscription/:subscriptionId` | Get subscription usage  | User/Admin |
| GET    | `/api/v1/subscription-usage-logs/:logId`                       | Get log by ID           | User/Admin |
| GET    | `/api/v1/subscription-usage-logs/feature/:featureId`           | Get feature usage stats | Admin      |
| POST   | `/api/v1/subscription-usage-logs`                              | Log feature usage       | System     |

---

## 21. Subscription Change Request APIs

| Method | Endpoint                                                  | Description           | Access     |
| ------ | --------------------------------------------------------- | --------------------- | ---------- |
| GET    | `/api/v1/subscription-change-requests`                    | Get all requests      | Admin      |
| GET    | `/api/v1/subscription-change-requests/:requestId`         | Get request by ID     | User/Admin |
| GET    | `/api/v1/subscription-change-requests/user/:userId`       | Get user requests     | User/Admin |
| POST   | `/api/v1/subscription-change-requests`                    | Create change request | User       |
| PATCH  | `/api/v1/subscription-change-requests/:requestId/approve` | Approve request       | Admin      |
| PATCH  | `/api/v1/subscription-change-requests/:requestId/reject`  | Reject request        | Admin      |
| DELETE | `/api/v1/subscription-change-requests/:requestId`         | Cancel request        | User/Admin |
| GET    | `/api/v1/subscription-change-requests/pending`            | Get pending requests  | Admin      |

---

## 22. Subscription Refund APIs

| Method | Endpoint                                                             | Description              | Access       |
| ------ | -------------------------------------------------------------------- | ------------------------ | ------------ |
| GET    | `/api/v1/subscription-refunds`                                       | Get all refunds          | Admin        |
| GET    | `/api/v1/subscription-refunds/:refundId`                             | Get refund by ID         | User/Admin   |
| GET    | `/api/v1/subscription-refunds/user/:userId`                          | Get user refunds         | User/Admin   |
| POST   | `/api/v1/subscription-refunds`                                       | Request refund           | User         |
| PATCH  | `/api/v1/subscription-refunds/:refundId/approve`                     | Approve refund           | Admin        |
| PATCH  | `/api/v1/subscription-refunds/:refundId/reject`                      | Reject refund            | Admin        |
| PATCH  | `/api/v1/subscription-refunds/:refundId/process`                     | Process refund           | Admin/System |
| GET    | `/api/v1/subscription-refunds/pending`                               | Get pending refunds      | Admin        |
| GET    | `/api/v1/subscription-refunds/subscription/:subscriptionId/eligible` | Check refund eligibility | User         |

---

## 23. Vehicle Management APIs

| Method | Endpoint                                              | Description                          | Access                 |
| ------ | ----------------------------------------------------- | ------------------------------------ | ---------------------- |
| GET    | `/api/v1/vehicles`                                    | Get all vehicles                     | User                   |
| GET    | `/api/v1/vehicles/:vehicleId`                         | Get vehicle by ID                    | User                   |
| GET    | `/api/v1/vehicles/client/:clientId`                   | Get client vehicles                  | User/Transport Manager |
| GET    | `/api/v1/vehicles/driver/:driverId`                   | Get vehicle by driver                | User                   |
| GET    | `/api/v1/vehicles/license-plate/:plate`               | Get vehicle by plate                 | User                   |
| GET    | `/api/v1/vehicles/status/:status`                     | Get vehicles by status               | User                   |
| POST   | `/api/v1/vehicles`                                    | Create vehicle                       | User                   |
| PUT    | `/api/v1/vehicles/:vehicleId`                         | Update vehicle                       | User/Admin             |
| PATCH  | `/api/v1/vehicles/:vehicleId/status`                  | Update vehicle status                | User/Admin             |
| DELETE | `/api/v1/vehicles/:vehicleId`                         | Delete vehicle                       | User/Admin             |
| POST   | `/api/v1/vehicles/:vehicleId/attachments`             | Add attachments                      | User                   |
| DELETE | `/api/v1/vehicles/:vehicleId/attachments/:documentId` | Remove attachment                    | User                   |
| GET    | `/api/v1/vehicles/expiring-insurance`                 | Get vehicles with expiring insurance | User                   |
| GET    | `/api/v1/vehicles/expiring-ved`                       | Get vehicles with expiring VED       | User                   |
| GET    | `/api/v1/vehicles/due-service`                        | Get vehicles due for service         | User                   |

---

## 24. Driver Management APIs

| Method | Endpoint                                            | Description                       | Access                 |
| ------ | --------------------------------------------------- | --------------------------------- | ---------------------- |
| GET    | `/api/v1/drivers`                                   | Get all drivers                   | User                   |
| GET    | `/api/v1/drivers/:driverId`                         | Get driver by ID                  | User                   |
| GET    | `/api/v1/drivers/employer/:employerId`              | Get employer's drivers            | User/Transport Manager |
| GET    | `/api/v1/drivers/license/:licenseNumber`            | Get driver by license             | User                   |
| GET    | `/api/v1/drivers/employed`                          | Get employed drivers              | User                   |
| GET    | `/api/v1/drivers/unemployed`                        | Get unemployed drivers            | User                   |
| POST   | `/api/v1/drivers`                                   | Create driver                     | User                   |
| PUT    | `/api/v1/drivers/:driverId`                         | Update driver                     | User/Admin             |
| PATCH  | `/api/v1/drivers/:driverId/employment`              | Update employment status          | User/Admin             |
| DELETE | `/api/v1/drivers/:driverId`                         | Delete driver                     | User/Admin             |
| POST   | `/api/v1/drivers/:driverId/attachments`             | Add attachments                   | User                   |
| DELETE | `/api/v1/drivers/:driverId/attachments/:documentId` | Remove attachment                 | User                   |
| GET    | `/api/v1/drivers/expiring-license`                  | Get drivers with expiring license | User                   |
| GET    | `/api/v1/drivers/expiring-cpc`                      | Get drivers with expiring CPC     | User                   |
| GET    | `/api/v1/drivers/checks-due`                        | Get drivers with checks due       | User                   |
| POST   | `/api/v1/drivers/:driverId/check`                   | Record driver check               | User                   |

---

## 25. Driver Tachograph APIs

| Method | Endpoint                                        | Description                | Access     |
| ------ | ----------------------------------------------- | -------------------------- | ---------- |
| GET    | `/api/v1/driver-tachographs`                    | Get all tachograph records | User       |
| GET    | `/api/v1/driver-tachographs/:tachographId`      | Get record by ID           | User       |
| GET    | `/api/v1/driver-tachographs/driver/:driverId`   | Get driver records         | User       |
| GET    | `/api/v1/driver-tachographs/vehicle/:vehicleId` | Get vehicle records        | User       |
| POST   | `/api/v1/driver-tachographs`                    | Create tachograph record   | User       |
| PUT    | `/api/v1/driver-tachographs/:tachographId`      | Update record              | User/Admin |
| PATCH  | `/api/v1/driver-tachographs/:tachographId/sign` | Sign record                | User       |
| DELETE | `/api/v1/driver-tachographs/:tachographId`      | Delete record              | Admin      |
| GET    | `/api/v1/driver-tachographs/infringements`      | Get all infringements      | User       |
| GET    | `/api/v1/driver-tachographs/unsigned`           | Get unsigned records       | User       |

---

## 26. Fuel Usage APIs

| Method | Endpoint                                       | Description                  | Access     |
| ------ | ---------------------------------------------- | ---------------------------- | ---------- |
| GET    | `/api/v1/fuel-usages`                          | Get all fuel records         | User       |
| GET    | `/api/v1/fuel-usages/:fuelUsageId`             | Get record by ID             | User       |
| GET    | `/api/v1/fuel-usages/vehicle/:vehicleId`       | Get vehicle fuel usage       | User       |
| GET    | `/api/v1/fuel-usages/driver/:driverId`         | Get driver fuel usage        | User       |
| POST   | `/api/v1/fuel-usages`                          | Create fuel record           | User       |
| PUT    | `/api/v1/fuel-usages/:fuelUsageId`             | Update fuel record           | User/Admin |
| DELETE | `/api/v1/fuel-usages/:fuelUsageId`             | Delete fuel record           | User/Admin |
| GET    | `/api/v1/fuel-usages/vehicle/:vehicleId/stats` | Get vehicle fuel statistics  | User       |
| GET    | `/api/v1/fuel-usages/driver/:driverId/stats`   | Get driver fuel statistics   | User       |
| GET    | `/api/v1/fuel-usages/date-range`               | Get fuel usage by date range | User       |

---

## 27. Subcontractor APIs

| Method | Endpoint                                    | Description               | Access     |
| ------ | ------------------------------------------- | ------------------------- | ---------- |
| GET    | `/api/v1/subcontractors`                    | Get all subcontractors    | User       |
| GET    | `/api/v1/subcontractors/:subcontractorId`   | Get subcontractor by ID   | User       |
| GET    | `/api/v1/subcontractors/creator/:creatorId` | Get user's subcontractors | User       |
| POST   | `/api/v1/subcontractors`                    | Create subcontractor      | User       |
| PUT    | `/api/v1/subcontractors/:subcontractorId`   | Update subcontractor      | User/Admin |
| DELETE | `/api/v1/subcontractors/:subcontractorId`   | Delete subcontractor      | User/Admin |
| GET    | `/api/v1/subcontractors/expiring-insurance` | Get expiring insurance    | User       |
| GET    | `/api/v1/subcontractors/expiring-git`       | Get expiring GIT          | User       |
| GET    | `/api/v1/subcontractors/rating/:minRating`  | Get by minimum rating     | User       |

---

## 28. Spot Check APIs

| Method | Endpoint                                       | Description                | Access     |
| ------ | ---------------------------------------------- | -------------------------- | ---------- |
| GET    | `/api/v1/spot-checks`                          | Get all spot checks        | User       |
| GET    | `/api/v1/spot-checks/:spotCheckId`             | Get spot check by ID       | User       |
| GET    | `/api/v1/spot-checks/vehicle/:vehicleId`       | Get vehicle spot checks    | User       |
| POST   | `/api/v1/spot-checks`                          | Create spot check          | User       |
| PUT    | `/api/v1/spot-checks/:spotCheckId`             | Update spot check          | User/Admin |
| PATCH  | `/api/v1/spot-checks/:spotCheckId/complete`    | Mark as completed          | User       |
| DELETE | `/api/v1/spot-checks/:spotCheckId`             | Delete spot check          | User/Admin |
| POST   | `/api/v1/spot-checks/:spotCheckId/attachments` | Add attachments            | User       |
| GET    | `/api/v1/spot-checks/pending`                  | Get pending spot checks    | User       |
| GET    | `/api/v1/spot-checks/overdue`                  | Get overdue rectifications | User       |

---

## 29. PG9 & PG13 Plan APIs

| Method | Endpoint                                    | Description                 | Access     |
| ------ | ------------------------------------------- | --------------------------- | ---------- |
| GET    | `/api/v1/pg9-pg13-plans`                    | Get all plans               | User       |
| GET    | `/api/v1/pg9-pg13-plans/:planId`            | Get plan by ID              | User       |
| GET    | `/api/v1/pg9-pg13-plans/vehicle/:vehicleId` | Get vehicle plans           | User       |
| GET    | `/api/v1/pg9-pg13-plans/type/:issueType`    | Get by issue type           | User       |
| POST   | `/api/v1/pg9-pg13-plans`                    | Create plan                 | User       |
| PUT    | `/api/v1/pg9-pg13-plans/:planId`            | Update plan                 | User/Admin |
| PATCH  | `/api/v1/pg9-pg13-plans/:planId/clearance`  | Update clearance status     | User/Admin |
| DELETE | `/api/v1/pg9-pg13-plans/:planId`            | Delete plan                 | User/Admin |
| GET    | `/api/v1/pg9-pg13-plans/pending`            | Get pending clearances      | User       |
| GET    | `/api/v1/pg9-pg13-plans/follow-up`          | Get plans needing follow-up | User       |

---

## 30. ORS Plan APIs

| Method | Endpoint                                          | Description       | Access     |
| ------ | ------------------------------------------------- | ----------------- | ---------- |
| GET    | `/api/v1/ors-plans`                               | Get all ORS plans | User       |
| GET    | `/api/v1/ors-plans/:planId`                       | Get plan by ID    | User       |
| POST   | `/api/v1/ors-plans`                               | Create ORS plan   | User       |
| PUT    | `/api/v1/ors-plans/:planId`                       | Update ORS plan   | User/Admin |
| DELETE | `/api/v1/ors-plans/:planId`                       | Delete ORS plan   | User/Admin |
| POST   | `/api/v1/ors-plans/:planId/documents`             | Add documents     | User       |
| DELETE | `/api/v1/ors-plans/:planId/documents/:documentId` | Remove document   | User       |

---

## 31. Traffic Commissioner Communication APIs

| Method | Endpoint                                                                   | Description            | Access     |
| ------ | -------------------------------------------------------------------------- | ---------------------- | ---------- |
| GET    | `/api/v1/traffic-commissioner-communications`                              | Get all communications | User       |
| GET    | `/api/v1/traffic-commissioner-communications/:communicationId`             | Get by ID              | User       |
| GET    | `/api/v1/traffic-commissioner-communications/type/:type`                   | Get by type            | User       |
| POST   | `/api/v1/traffic-commissioner-communications`                              | Create communication   | User       |
| PUT    | `/api/v1/traffic-commissioner-communications/:communicationId`             | Update communication   | User/Admin |
| DELETE | `/api/v1/traffic-commissioner-communications/:communicationId`             | Delete communication   | User/Admin |
| POST   | `/api/v1/traffic-commissioner-communications/:communicationId/attachments` | Add attachments        | User       |

---

## 32. Renewal Tracker APIs

| Method | Endpoint                                       | Description           | Access     |
| ------ | ---------------------------------------------- | --------------------- | ---------- |
| GET    | `/api/v1/renewal-trackers`                     | Get all renewals      | User       |
| GET    | `/api/v1/renewal-trackers/:renewalId`          | Get renewal by ID     | User       |
| GET    | `/api/v1/renewal-trackers/type/:type`          | Get by type           | User       |
| POST   | `/api/v1/renewal-trackers`                     | Create renewal item   | User       |
| PUT    | `/api/v1/renewal-trackers/:renewalId`          | Update renewal        | User/Admin |
| DELETE | `/api/v1/renewal-trackers/:renewalId`          | Delete renewal        | User/Admin |
| GET    | `/api/v1/renewal-trackers/expiring`            | Get expiring renewals | User       |
| GET    | `/api/v1/renewal-trackers/expired`             | Get expired renewals  | User       |
| PATCH  | `/api/v1/renewal-trackers/:renewalId/reminder` | Set/Update reminder   | User       |
| PATCH  | `/api/v1/renewal-trackers/:renewalId/status`   | Update status         | User       |

---

## 33. Audit & Rectification Report APIs

| Method | Endpoint                                                     | Description      | Access     |
| ------ | ------------------------------------------------------------ | ---------------- | ---------- |
| GET    | `/api/v1/audits-rectification-reports`                       | Get all reports  | User       |
| GET    | `/api/v1/audits-rectification-reports/:reportId`             | Get report by ID | User       |
| GET    | `/api/v1/audits-rectification-reports/type/:type`            | Get by type      | User       |
| POST   | `/api/v1/audits-rectification-reports`                       | Create report    | User       |
| PUT    | `/api/v1/audits-rectification-reports/:reportId`             | Update report    | User/Admin |
| DELETE | `/api/v1/audits-rectification-reports/:reportId`             | Delete report    | User/Admin |
| POST   | `/api/v1/audits-rectification-reports/:reportId/attachments` | Add attachments  | User       |

---

## 34. Wheel Retorque Policy Monitoring APIs

| Method | Endpoint                                                    | Description           | Access     |
| ------ | ----------------------------------------------------------- | --------------------- | ---------- |
| GET    | `/api/v1/wheel-retorque-monitorings`                        | Get all records       | User       |
| GET    | `/api/v1/wheel-retorque-monitorings/:monitoringId`          | Get record by ID      | User       |
| GET    | `/api/v1/wheel-retorque-monitorings/vehicle/:vehicleId`     | Get vehicle records   | User       |
| POST   | `/api/v1/wheel-retorque-monitorings`                        | Create record         | User       |
| PUT    | `/api/v1/wheel-retorque-monitorings/:monitoringId`          | Update record         | User/Admin |
| PATCH  | `/api/v1/wheel-retorque-monitorings/:monitoringId/complete` | Mark completed        | User       |
| DELETE | `/api/v1/wheel-retorque-monitorings/:monitoringId`          | Delete record         | User/Admin |
| GET    | `/api/v1/wheel-retorque-monitorings/due`                    | Get due retorques     | User       |
| GET    | `/api/v1/wheel-retorque-monitorings/overdue`                | Get overdue retorques | User       |

---

## 35. Compliance Timetable APIs

| Method | Endpoint                                       | Description        | Access     |
| ------ | ---------------------------------------------- | ------------------ | ---------- |
| GET    | `/api/v1/compliance-timetables`                | Get all tasks      | User       |
| GET    | `/api/v1/compliance-timetables/:taskId`        | Get task by ID     | User       |
| GET    | `/api/v1/compliance-timetables/status/:status` | Get by status      | User       |
| POST   | `/api/v1/compliance-timetables`                | Create task        | User       |
| PUT    | `/api/v1/compliance-timetables/:taskId`        | Update task        | User/Admin |
| PATCH  | `/api/v1/compliance-timetables/:taskId/status` | Update status      | User       |
| DELETE | `/api/v1/compliance-timetables/:taskId`        | Delete task        | User/Admin |
| GET    | `/api/v1/compliance-timetables/upcoming`       | Get upcoming tasks | User       |
| GET    | `/api/v1/compliance-timetables/overdue`        | Get overdue tasks  | User       |

---

## 36. Dashboard & Analytics APIs

| Method | Endpoint                                | Description            | Access     |
| ------ | --------------------------------------- | ---------------------- | ---------- |
| GET    | `/api/v1/dashboard/overview`            | Get dashboard overview | User       |
| GET    | `/api/v1/dashboard/stats`               | Get statistics         | User       |
| GET    | `/api/v1/dashboard/vehicles/summary`    | Vehicle summary        | User       |
| GET    | `/api/v1/dashboard/drivers/summary`     | Driver summary         | User       |
| GET    | `/api/v1/dashboard/compliance/summary`  | Compliance summary     | User       |
| GET    | `/api/v1/dashboard/subscription/status` | Subscription status    | User       |
| GET    | `/api/v1/dashboard/alerts`              | Get all alerts         | User       |
| GET    | `/api/v1/dashboard/upcoming-tasks`      | Get upcoming tasks     | User       |
| GET    | `/api/v1/dashboard/financial-overview`  | Financial overview     | User/Admin |

---

## 37. Reports & Export APIs

| Method | Endpoint                             | Description                | Access     |
| ------ | ------------------------------------ | -------------------------- | ---------- |
| POST   | `/api/v1/reports/vehicles`           | Generate vehicle report    | User       |
| POST   | `/api/v1/reports/drivers`            | Generate driver report     | User       |
| POST   | `/api/v1/reports/fuel-usage`         | Generate fuel report       | User       |
| POST   | `/api/v1/reports/compliance`         | Generate compliance report | User       |
| POST   | `/api/v1/reports/financial`          | Generate financial report  | User/Admin |
| POST   | `/api/v1/reports/subscription-usage` | Generate usage report      | Admin      |
| GET    | `/api/v1/reports/:reportId/download` | Download report            | User       |
| GET    | `/api/v1/reports/history`            | Get report history         | User       |
| POST   | `/api/v1/exports/vehicles`           | Export vehicles CSV/Excel  | User       |
| POST   | `/api/v1/exports/drivers`            | Export drivers CSV/Excel   | User       |
| POST   | `/api/v1/exports/invoices`           | Export invoices CSV/Excel  | User       |

---

## 38. Admin Management APIs

| Method | Endpoint                                             | Description                 | Access |
| ------ | ---------------------------------------------------- | --------------------------- | ------ |
| GET    | `/api/v1/admin/users`                                | Get all users with filters  | Admin  |
| GET    | `/api/v1/admin/subscriptions`                        | Manage all subscriptions    | Admin  |
| POST   | `/api/v1/admin/subscriptions/assign`                 | Assign subscription to user | Admin  |
| PATCH  | `/api/v1/admin/subscriptions/:subscriptionId/extend` | Extend subscription         | Admin  |
| GET    | `/api/v1/admin/revenue`                              | Get revenue statistics      | Admin  |
| GET    | `/api/v1/admin/system-health`                        | System health check         | Admin  |
| GET    | `/api/v1/admin/logs`                                 | Get system logs             | Admin  |
| POST   | `/api/v1/admin/broadcast-notification`               | Send notification to all    | Admin  |

---

## 39. Subscription Request & Approval APIs (NEW)

| Method | Endpoint                                           | Description          | Access     |
| ------ | -------------------------------------------------- | -------------------- | ---------- |
| POST   | `/api/v1/subscription-requests`                    | Request subscription | User       |
| GET    | `/api/v1/subscription-requests`                    | Get all requests     | Admin      |
| GET    | `/api/v1/subscription-requests/:requestId`         | Get request by ID    | User/Admin |
| GET    | `/api/v1/subscription-requests/user/:userId`       | Get user requests    | User/Admin |
| GET    | `/api/v1/subscription-requests/pending`            | Get pending requests | Admin      |
| PATCH  | `/api/v1/subscription-requests/:requestId/approve` | Approve request      | Admin      |
| PATCH  | `/api/v1/subscription-requests/:requestId/reject`  | Reject request       | Admin      |
| PUT    | `/api/v1/subscription-requests/:requestId`         | Update request       | User       |
| DELETE | `/api/v1/subscription-requests/:requestId`         | Cancel request       | User       |

---

## 40. Transport Manager - Client Limit APIs (NEW)

| Method | Endpoint                                                   | Description              | Access        |
| ------ | ---------------------------------------------------------- | ------------------------ | ------------- |
| GET    | `/api/v1/transport-managers/:managerId/client-count`       | Get current client count | Manager/Admin |
| GET    | `/api/v1/transport-managers/:managerId/available-slots`    | Get available slots      | Manager       |
| POST   | `/api/v1/transport-managers/:managerId/client-request`     | Request to add client    | Manager       |
| DELETE | `/api/v1/transport-managers/:managerId/clients/:clientId`  | Remove client            | Manager/Admin |
| GET    | `/api/v1/transport-managers/:managerId/clients-near-limit` | Check near limit         | Manager       |

---

## Summary Statistics

### Total API Endpoints: **400+**

### Breakdown by Category:

- **Authentication**: 8 endpoints
- **User Management**: 8 endpoints
- **Repository Settings**: 4 endpoints
- **Notifications**: 8 endpoints
- **Activity Logs**: 6 endpoints
- **Login Activities**: 5 endpoints
- **Documents**: 8 endpoints
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

```


```
