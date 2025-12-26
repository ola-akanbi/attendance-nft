;; Proof of Attendance NFT Contract
;; Allows event organizers to issue verifiable attendance NFTs

;; Implement the SIP-009 NFT trait
;; TESTNET: Use ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.nft-trait.nft-trait
;; MAINNET: Use SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait
(impl-trait 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.nft-trait.nft-trait)

;; Define the NFT
(define-non-fungible-token attendance-nft uint)

;; Data Variables
(define-data-var last-token-id uint u0)
(define-data-var last-event-id uint u0)
(define-data-var base-token-uri (string-ascii 256) "https://attendance.example.com/metadata/")

;; Data Maps
;; Event registry: event-id -> event details
(define-map events
  uint
  {
    name: (string-ascii 100),
    organizer: principal,
    date: uint,
    max-attendees: uint,
    issued-count: uint,
    is-active: bool
  }
)

;; Attendance records: (event-id, attendee) -> token-id
(define-map attendance-records
  { event-id: uint, attendee: principal }
  { token-id: uint, issued-at: uint }
)

;; Token metadata: token-id -> event-id
(define-map token-to-event
  uint
  uint
)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-NOT-TOKEN-OWNER (err u101))
(define-constant ERR-EVENT-NOT-FOUND (err u102))
(define-constant ERR-EVENT-CLOSED (err u103))
(define-constant ERR-ALREADY-ATTENDED (err u104))
(define-constant ERR-MAX-ATTENDEES-REACHED (err u105))
(define-constant ERR-INVALID-EVENT-DATA (err u106))

;; SIP-009 Required Functions

;; Get the last token ID
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)