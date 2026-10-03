# Security Specification - ConectAí Marketplace Local & Serviços

## 1. Data Invariants
1. **User Identity & Role Protection**: A regular user cannot escalate their role to `master` or alter their own account status from suspended to active. Only verified platform master or admin can grant administrative/worker privileges.
2. **Bootstrapped Master Access**: The system administrator (`telecom.david@gmail.com`) holds Master root authorization across settings, stores, workers, audits, and moderation.
3. **Multi-Store Isolation**: A merchant can only create, update, or delete products and store details belonging to their authenticated `ownerUid` or `storeId`. Merchants cannot read or mutate other merchants' payouts, bank details, or private orders.
4. **Order Integrity & Fee Immutability**: Customers cannot manipulate the platform commission, order total, delivery fee, or status transitions directly. Status transitions must follow defined workflows (pending -> preparing -> ready -> driver_assigned -> delivered).
5. **Logistics Authorization**: Only assigned delivery drivers or the store owner / customer of that order can update delivery logistics states.
6. **Granular Worker Permissions**: Workers (Atendimento, Financeiro, Operações, Moderador, Suporte) have restricted, role-based read/write access defined in their worker records.
7. **Audit Trail Immutability**: Audit logs are append-only; historical logs can never be modified or deleted.

## 2. The Dirty Dozen Payloads (Targeting Exploits)
1. **Privilege Escalation**: Non-admin user sending `{ role: "master" }` to `/users/{uid}`.
2. **Shadow Merchant Impersonation**: Attacker creating a store with another user's `ownerUid`.
3. **Price Tampering on Order**: Customer creating an order with `total: 0.01` while items sum to `R$ 150.00`.
4. **Platform Commission Zeroing**: Merchant attempting to update order with `{ platformCommission: 0 }`.
5. **Unauthorized Status Leap**: Customer forcing order status directly to `delivered` without driver or merchant action.
6. **Driver Hijacking**: Unassigned driver claiming completed earnings on an order without being assigned.
7. **Cross-Tenant Product Injection**: Store B writing a product with `storeId: StoreA_id`.
8. **Worker Privilege Forgery**: Worker attempting to modify their own `permissions` array in `/workers/{id}`.
9. **Settings Poisoning**: Non-master attempting to overwrite `/platformSettings/global` commission rates.
10. **Audit Log Deletion**: Malicious operator attempting `deleteDoc` on `/auditLogs/{logId}`.
11. **PII Harvesting Attack**: Unauthenticated actor querying all customer addresses and telephone numbers.
12. **Fake Review Injection**: Unauthenticated user posting 5-star reviews to stores without an associated user identity.

## 3. Test Runner Invariant
All Dirty Dozen payloads must evaluate to `PERMISSION_DENIED`.
