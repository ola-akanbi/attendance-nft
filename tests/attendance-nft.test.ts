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