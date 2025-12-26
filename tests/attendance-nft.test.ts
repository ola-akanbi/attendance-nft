import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const organizer = accounts.get("wallet_1")!;
const attendee1 = accounts.get("wallet_2")!;
const attendee2 = accounts.get("wallet_3")!;
const attendee3 = accounts.get("wallet_4")!;

describe("Attendance NFT Contract Tests", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  describe("SIP-009 NFT Trait Functions", () => {
    it("get-last-token-id returns 0 initially", () => {
      const { result } = simnet.callReadOnlyFn(
        "attendance-nft",
        "get-last-token-id",
        [],
        organizer
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("get-token-uri returns base URI", () => {
      const { result } = simnet.callReadOnlyFn(
        "attendance-nft",
        "get-token-uri",
        [Cl.uint(1)],
        organizer
      );
      expect(result).toBeOk(
        Cl.some(Cl.stringAscii("https://attendance.example.com/metadata/"))
      );
    });

    it("get-owner returns none for non-existent token", () => {
      const { result } = simnet.callReadOnlyFn(
        "attendance-nft",
        "get-owner",
        [Cl.uint(1)],
        organizer
      );
      expect(result).toBeOk(Cl.none());
    });

    it("transfer fails when sender is not tx-sender", () => {
      const { result } = simnet.callPublicFn(
        "attendance-nft",
        "transfer",
        [Cl.uint(1), Cl.principal(attendee1), Cl.principal(attendee2)],
        organizer
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });
  });

  describe("Event Management", () => {
    it("creates an event successfully", () => {
      const futureBlock = simnet.blockHeight + 100;
      const { result } = simnet.callPublicFn(
        "attendance-nft",
        "create-event",
        [
          Cl.stringAscii("Web3 Conference"),
          Cl.uint(futureBlock),
          Cl.uint(100),
        ],
        organizer
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("fails to create event with empty name", () => {
      const futureBlock = simnet.blockHeight + 100;
      const { result } = simnet.callPublicFn(
        "attendance-nft",
        "create-event",
        [Cl.stringAscii(""), Cl.uint(futureBlock), Cl.uint(100)],
        organizer
      );
      expect(result).toBeErr(Cl.uint(106)); // ERR-INVALID-EVENT-DATA
    });

    it("fails to create event with past date", () => {
      const pastBlock = simnet.blockHeight - 1;
      const { result } = simnet.callPublicFn(
        "attendance-nft",
        "create-event",
        [Cl.stringAscii("Past Event"), Cl.uint(pastBlock), Cl.uint(100)],
        organizer
      );
      expect(result).toBeErr(Cl.uint(106)); // ERR-INVALID-EVENT-DATA
    });

    it("fails to create event with zero max attendees", () => {
      const futureBlock = simnet.blockHeight + 100;
      const { result } = simnet.callPublicFn(
        "attendance-nft",
        "create-event",
        [Cl.stringAscii("Invalid Event"), Cl.uint(futureBlock), Cl.uint(0)],
        organizer
      );
      expect(result).toBeErr(Cl.uint(106)); // ERR-INVALID-EVENT-DATA
    });

    it("creates multiple events with incrementing IDs", () => {
      const futureBlock = simnet.blockHeight + 100;
      
      const event1 = simnet.callPublicFn(
        "attendance-nft",
        "create-event",
        [Cl.stringAscii("Event 1"), Cl.uint(futureBlock), Cl.uint(50)],
        organizer
      );
      expect(event1.result).toBeOk(Cl.uint(1));

      const event2 = simnet.callPublicFn(
        "attendance-nft",
        "create-event",
        [Cl.stringAscii("Event 2"), Cl.uint(futureBlock), Cl.uint(75)],
        organizer
      );
      expect(event2.result).toBeOk(Cl.uint(2));
    });

    it("retrieves event details correctly", () => {
      const futureBlock = simnet.blockHeight + 100;
      simnet.callPublicFn(
        "attendance-nft",
        "create-event",
        [Cl.stringAscii("Test Event"), Cl.uint(futureBlock), Cl.uint(100)],
        organizer
      );

      const { result } = simnet.callReadOnlyFn(
        "attendance-nft",
        "get-event",
        [Cl.uint(1)],
        organizer
      );
      
      expect(result).toBeSome(
        Cl.tuple({
          name: Cl.stringAscii("Test Event"),
          organizer: Cl.principal(organizer),
          date: Cl.uint(futureBlock),
          "max-attendees": Cl.uint(100),
          "issued-count": Cl.uint(0),
          "is-active": Cl.bool(true),
        })
      );
    });

    it("closes event successfully", () => {
      const futureBlock = simnet.blockHeight + 100;
      simnet.callPublicFn(
        "attendance-nft",
        "create-event",
        [Cl.stringAscii("Event to Close"), Cl.uint(futureBlock), Cl.uint(50)],
        organizer
      );

      const { result } = simnet.callPublicFn(
        "attendance-nft",
        "close-event",
        [Cl.uint(1)],
        organizer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify event is closed
      const eventData = simnet.callReadOnlyFn(
        "attendance-nft",
        "get-event",
        [Cl.uint(1)],
        organizer
      );
      expect(eventData.result).toBeSome(
        Cl.tuple({
          name: Cl.stringAscii("Event to Close"),
          organizer: Cl.principal(organizer),
          date: Cl.uint(futureBlock),
          "max-attendees": Cl.uint(50),
          "issued-count": Cl.uint(0),
          "is-active": Cl.bool(false),
        })
      );
    });

    it("fails to close non-existent event", () => {
      const { result } = simnet.callPublicFn(
        "attendance-nft",
        "close-event",
        [Cl.uint(999)],
        organizer
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR-EVENT-NOT-FOUND
    });

    it("fails to close event by non-organizer", () => {
      const futureBlock = simnet.blockHeight + 100;
      simnet.callPublicFn(
        "attendance-nft",
        "create-event",
        [Cl.stringAscii("Protected Event"), Cl.uint(futureBlock), Cl.uint(50)],
        organizer
      );

      const { result } = simnet.callPublicFn(
        "attendance-nft",
        "close-event",
        [Cl.uint(1)],
        attendee1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });
  });

  describe("Attendance Issuance", () => {
    beforeEach(() => {
      const futureBlock = simnet.blockHeight + 100;
      simnet.callPublicFn(
        "attendance-nft",
        "create-event",
        [Cl.stringAscii("Conference 2025"), Cl.uint(futureBlock), Cl.uint(3)],
        organizer
      );
    });

    it("issues attendance NFT successfully", () => {
      const { result } = simnet.callPublicFn(
        "attendance-nft",
        "issue-attendance",
        [Cl.uint(1), Cl.principal(attendee1)],
        organizer
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("updates token count after issuing", () => {
      simnet.callPublicFn(
        "attendance-nft",
        "issue-attendance",
        [Cl.uint(1), Cl.principal(attendee1)],
        organizer
      );

      const { result } = simnet.callReadOnlyFn(
        "attendance-nft",
        "get-last-token-id",
        [],
        organizer
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("attendee owns the minted NFT", () => {
      simnet.callPublicFn(
        "attendance-nft",
        "issue-attendance",
        [Cl.uint(1), Cl.principal(attendee1)],
        organizer
      );

      const { result } = simnet.callReadOnlyFn(
        "attendance-nft",
        "get-owner",
        [Cl.uint(1)],
        organizer
      );
      expect(result).toBeOk(Cl.some(Cl.principal(attendee1)));
    });

    it("fails to issue to non-existent event", () => {
      const { result } = simnet.callPublicFn(
        "attendance-nft",
        "issue-attendance",
        [Cl.uint(999), Cl.principal(attendee1)],
        organizer
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR-EVENT-NOT-FOUND
    });

    it("fails when non-organizer tries to issue", () => {
      const { result } = simnet.callPublicFn(
        "attendance-nft",
        "issue-attendance",
        [Cl.uint(1), Cl.principal(attendee2)],
        attendee1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it("fails to issue attendance twice to same attendee", () => {
      simnet.callPublicFn(
        "attendance-nft",
        "issue-attendance",
        [Cl.uint(1), Cl.principal(attendee1)],
        organizer
      );

      const { result } = simnet.callPublicFn(
        "attendance-nft",
        "issue-attendance",
        [Cl.uint(1), Cl.principal(attendee1)],
        organizer
      );
      expect(result).toBeErr(Cl.uint(104)); // ERR-ALREADY-ATTENDED
    });

    it("fails when max attendees reached", () => {
      // Issue to 3 attendees (max)
      simnet.callPublicFn(
        "attendance-nft",
        "issue-attendance",
        [Cl.uint(1), Cl.principal(attendee1)],
        organizer
      );
      simnet.callPublicFn(
        "attendance-nft",
        "issue-attendance",
        [Cl.uint(1), Cl.principal(attendee2)],
        organizer
      );
      simnet.callPublicFn(
        "attendance-nft",
        "issue-attendance",
        [Cl.uint(1), Cl.principal(attendee3)],
        organizer
      );

      // Try to issue to 4th attendee
      const { result } = simnet.callPublicFn(
        "attendance-nft",
        "issue-attendance",
        [Cl.uint(1), Cl.principal(deployer)],
        organizer
      );
      expect(result).toBeErr(Cl.uint(105)); // ERR-MAX-ATTENDEES-REACHED
    });