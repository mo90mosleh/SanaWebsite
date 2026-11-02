import { test } from "node:test";
import assert from "node:assert/strict";
import {
  seed,
  createTicket,
  replyToTicket,
  ticketStatus,
  ticketReference,
  migratePresentation,
} from "../src/domain.ts";
test("ticket creation requires an owned purchased device and snapshots identity with a stable number/date", () => {
  const s = seed();
  for (const id of ["", "d3", "nonexistent"])
    assert.throws(() =>
      createTicket(s, "c1", id, "راهنمای دستگاه", "توضیح مشکل"),
    );
  assert.throws(() => createTicket(s, "c1", "d1", "   ", "متن"));
  assert.throws(() => createTicket(s, "c1", "d1", "موضوع", "   "));
  const ticket = createTicket(s, "c1", "d1", " بررسی دستگاه ", " متن درخواست ");
  assert.equal(ticketReference(ticket), "SANA-T-1002");
  assert.equal(ticketStatus(ticket), "pending");
  assert.ok(ticket.createdAt && Number.isFinite(Date.parse(ticket.createdAt)));
  assert.equal(ticket.title, "بررسی دستگاه");
  assert.equal(ticket.messages[0].text, "متن درخواست");
  assert.deepEqual(ticket.device, {
    id: "d1",
    model: "FS-114",
    serial: "DEMO-FS114-001",
  });
  s.customers[0].devices[0].serial = "CHANGED";
  s.customers[0].devices.splice(0, 1);
  assert.equal(ticket.device!.serial, "DEMO-FS114-001");
  assert.equal(
    createTicket(s, "c1", "d2", "موضوع بعدی", "متن جدید").number,
    1003,
  );
});
test("support response is answered; customer follow-up reopens review without changing number or creation date", () => {
  const s = seed();
  const t = createTicket(s, "c1", "d1", "موضوع", "درخواست");
  const number = t.number,
    createdAt = t.createdAt;
  assert.throws(() =>
    replyToTicket(s, t.id, "customer", "c2", "پاسخ مرکز دیگر"),
  );
  assert.throws(() => replyToTicket(s, t.id, "admin", "c1", "  "));
  replyToTicket(s, t.id, "admin", "c1", "پاسخ پشتیبانی");
  assert.equal(ticketStatus(t), "answered");
  replyToTicket(s, t.id, "customer", "c1", "پیگیری مشتری");
  assert.equal(ticketStatus(t), "pending");
  assert.equal(t.messages.length, 3);
  assert.equal(t.number, number);
  assert.equal(t.createdAt, createdAt);
});
test("legacy ticket migration is idempotent and preserves IDs, replies and unknown device associations", () => {
  const s = seed();
  delete s.tickets[0].number;
  delete s.tickets[0].createdAt;
  delete s.tickets[0].device;
  const before = structuredClone(s.tickets[0]);
  migratePresentation(s);
  assert.equal(s.tickets[0].id, before.id);
  assert.deepEqual(s.tickets[0].messages, before.messages);
  assert.equal(s.tickets[0].createdAt, before.messages[0].time);
  assert.equal(s.tickets[0].device, undefined);
  const migrated = JSON.stringify(s.tickets);
  migratePresentation(s);
  assert.equal(JSON.stringify(s.tickets), migrated);
});
