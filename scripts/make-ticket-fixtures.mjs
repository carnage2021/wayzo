// One-off generator for tests/fixtures/tickets (synthetic tickets + one anonymised real itinerary).
// All names, codes and contact details are fictional. Run: node scripts/make-ticket-fixtures.mjs
import fs from "node:fs";

const dir = "tests/fixtures/tickets";
fs.mkdirSync(dir, { recursive: true });
const F = [];
const add = (name, text, bookings, trip = null) => F.push({ name, text, bookings, trip });

add(
  "01-vietjet-roundtrip",
  `Do not forget to "Check-in Online" 24 hours before your flight to Choose your favorite Seat and Check your flight status at "My booking" on our website.
TRAVEL ITINERARY
1. Booking Information
Booking Status CONFIRMED
Booking Date 12/11/2026
Full Name RIVERA, ALEX
Vietjet
XK47TP
Booking Number
2. Passenger(s) Information
Passenger Name(s) E-ticket Seat(s)
RIVERA, ALEX VJ1806 --, VJ1805 --
SHAH, PRIYA NEEL VJ1806 --, VJ1805 --
COSTA, MARCO LUIS VJ1806 --, VJ1805 --
3. Flight Information
Flight Number (Operated by) Date Fare Type Depart Arrive
VJ1806 Jan 12, 2027 Eco 23:50 - Ahmedabad-Sardar Vallabhbhai Patel 06:20 - Ho Chi Minh Terminal: 2
VJ1805 Jan 17, 2027 Eco 18:50 - Ho Chi Minh Terminal: 2 22:50 - Ahmedabad-Sardar Vallabhbhai Patel
Are you missing out on your SkyJoy Membership benefits? Earn points when flying with Vietjet.
INVOICE
All charges and payments appear in: USD
Fare and Fees
Leg Passenger Description Amount Tax Total
1 RIVERA,ALEX Z1ECO - Eco1 38.00 0.95 / 0.95 39.90
1 RIVERA,ALEX Fuel Surcharge IND 52.10 1.30 / 1.30 54.70
2 RIVERA,ALEX Airport Tax ITL 20.00 0 20.00
2 SHAH,PRIYA NEEL Z1ECO - Eco1 38.00 0.95 / 0.95 39.90
Total 822.57 33.60 856.17
Payment
Payment Date Payment Type Amount
12 November 2026 VJPVI UPC 856.17
Booking Offices in Vietnam
1. Tan Son Nhat Airport - Domestic Terminal. Hours: 03:30 - 23:00 (GMT+7), daily
2. Da Nang Airport Office. Hours: 04:35 - 22:15, daily`,
  [
    { type: "flight", provider: "vietjet", booking_code: "XK47TP", start_at: "2027-01-12T23:50", end_at: "2027-01-13T06:20", from_place: "ahmedabad", to_place: "ho chi minh" },
    { type: "flight", provider: "vietjet", booking_code: "XK47TP", start_at: "2027-01-17T18:50", end_at: "2027-01-17T22:50", from_place: "ho chi minh", to_place: "ahmedabad" },
  ],
);

add(
  "02-tap-lhr-lis",
  `Booking confirmation - Your trip to Lisbon
Booking reference: X7K2QP
Passenger: ALEX RIVERA
Flight TP 1351 Operated by TAP Air Portugal
Fri 12 Apr 2027 London Heathrow (LHR) Terminal 2 dep 11:05 -> Lisbon Humberto Delgado (LIS) Terminal 1 arr 13:40
Seat 14C Economy 1 checked bag
Total paid: GBP 142.30`,
  [{ type: "flight", provider: "tap", booking_code: "X7K2QP", start_at: "2027-04-12T11:05", end_at: "2027-04-12T13:40", from_place: "lhr", to_place: "lis", seat_or_room: "14C", price: 142.3, currency: "GBP" }],
);

add(
  "03-easyjet-return",
  `easyJet
Your booking EJY4M2N is confirmed
Hi Maya, thanks for booking with easyJet.
OUTBOUND  Wed 02 Jun 2027
EZY8217  London Gatwick (LGW) 06:45  ->  Barcelona El Prat (BCN) 09:55
RETURN  Mon 07 Jun 2027
EZY8218  Barcelona El Prat (BCN) 10:40  ->  London Gatwick (LGW) 12:05
Passengers: Maya Lopez, Sam Okafor
Seats: 12A, 12B (outbound) 21C, 21D (return)
Total price GBP 318.96
Manage your booking online. Bag drop opens 2 hours before departure.`,
  [
    { type: "flight", provider: "easyjet", booking_code: "EJY4M2N", start_at: "2027-06-02T06:45", end_at: "2027-06-02T09:55", from_place: "lgw", to_place: "bcn" },
    { type: "flight", provider: "easyjet", booking_code: "EJY4M2N", start_at: "2027-06-07T10:40", end_at: "2027-06-07T12:05", from_place: "bcn", to_place: "lgw" },
  ],
);

add(
  "04-indian-rail",
  `ELECTRONIC RESERVATION SLIP (ERS)
PNR: 2417836590   Train No./Name: 12952 / MUMBAI RAJDHANI
Class: AC 3 TIER (3A)   Quota: GENERAL (GN)
From: NEW DELHI (NDLS)   Departure* 16:55 18-Feb-2027
To: MUMBAI CENTRAL (MMCT)   Arrival* 08:35 19-Feb-2027
Boarding At: NEW DELHI (NDLS)
Passenger Details: 1. R KUMAR  Age 34  M  CNF/B4/35/LOWER
Total Fare: INR 3,215.00
*Departure and arrival times are local.`,
  [{ type: "train", booking_code: "2417836590", start_at: "2027-02-18T16:55", end_at: "2027-02-19T08:35", from_place: "delhi", to_place: "mumbai" }],
);

add(
  "05-eurostar",
  `Eurostar - Your booking is confirmed
Booking reference: QWERTY
London St Pancras International -> Paris Gare du Nord
Saturday 10 July 2027
Departs 08:01  Arrives 11:20  Train 9008
Coach 7, Seat 54 - Standard
Traveller: Leo Martin
Total: GBP 89.00`,
  [{ type: "train", provider: "eurostar", booking_code: "QWERTY", start_at: "2027-07-10T08:01", end_at: "2027-07-10T11:20", from_place: "london", to_place: "paris", currency: "GBP" }],
);

add(
  "06-flixbus",
  `FlixBus booking confirmation
Booking number: 3021 4498 7715
Berlin central bus station (ZOB)  14:30  Thu, 20.05.2027
Prague (Florenc)  19:15  Thu, 20.05.2027
Direct connection, 4h 45min
Passenger: Ana Costa, seat 23
Price: 24,99 EUR`,
  [{ type: "bus", provider: "flixbus", booking_code: "302144987715", start_at: "2027-05-20T14:30", end_at: "2027-05-20T19:15", from_place: "berlin", to_place: "prague" }],
);

add(
  "07-ferry-santorini",
  `Blue Star Ferries - E-ticket
Reservation code: BSF-88213
Route: Piraeus -> Santorini (Thira)
Departure: 07:25, 14/08/2027
Arrival: 15:20, 14/08/2027
Vessel: Blue Star Delos   Class: Economy (deck)
Passengers: 2 adults (N. Patel, K. Patel)
Total amount: 167.00 EUR`,
  [{ type: "ferry", booking_code: "BSF-88213", start_at: "2027-08-14T07:25", end_at: "2027-08-14T15:20", from_place: "piraeus", to_place: "santorini" }],
);

add(
  "08-hotel-booking",
  `Your booking is confirmed!
Hotel Lisboa Plaza
Travessa do Salitre 7, Avenida da Liberdade, 1269-066 Lisbon, Portugal
Confirmation number: 4421.873.906   PIN: 2231
Check-in: Monday, 12 April 2027 (from 15:00)
Check-out: Friday, 16 April 2027 (until 12:00)
Your reservation: 4 nights, 1 room
Guest name: Alex Rivera
Price: EUR 712.40 (includes taxes and charges)`,
  [{ type: "stay", provider: "lisboa plaza", booking_code: "4421.873.906", start_at: "2027-04-12", end_at: "2027-04-16", to_place: "lisbon" }],
);

add(
  "09-airbnb",
  `Your reservation is confirmed. You are going to Kyoto!
Machiya house near Gion with garden
Hosted by Hiroshi
Check-in Sat, Mar 27, 2027 4:00 PM
Checkout Fri, Apr 2, 2027 11:00 AM
Address: 3 Chome-117 Gionmachi Minamigawa, Higashiyama Ward, Kyoto
Guests: 4 adults
Confirmation code HMQ8T2XZ4A
Total (JPY) 186,400`,
  [{ type: "stay", booking_code: "HMQ8T2XZ4A", start_at: "2027-03-27T16:00", end_at: "2027-04-02T11:00", to_place: "kyoto", currency: "JPY" }],
);

add(
  "10-hostel",
  `Hostelworld booking confirmation
Booking ref: 18872633-554219
Property: Generator Amsterdam, Mauritskade 57, 1092 AD Amsterdam
Arriving: 05 Sep 2027  Departing: 08 Sep 2027 (3 nights)
1 x Bed in 6-bed mixed dorm
Name: S. Okafor
Deposit paid: EUR 13.56  Balance due on arrival: EUR 122.04`,
  [{ type: "stay", provider: "generator", booking_code: "18872633-554219", start_at: "2027-09-05", end_at: "2027-09-08", to_place: "amsterdam" }],
);

add(
  "11-car-rental",
  `Rental confirmation - SIXT
Reservation number: 9781223344
Pick-up: Faro Airport (FAO), Portugal - Tue 06.07.2027 10:00
Return: Faro Airport (FAO), Portugal - Sun 11.07.2027 10:00
Vehicle: VW Golf or similar (CDMR), manual
Driver: Marco Costa
Estimated total: 245.80 EUR`,
  [{ type: "car_rental", provider: "sixt", booking_code: "9781223344", start_at: "2027-07-06T10:00", end_at: "2027-07-11T10:00" }],
);

add(
  "12-restaurant",
  `Your table is booked!
Cervejaria Ramiro
Avenida Almirante Reis 1, 1150-007 Lisboa
Thursday, 15 April 2027 at 20:30
Party of 4 - under the name Rivera
Confirmation #RM-55102
Please arrive on time; tables are held for 15 minutes.`,
  [{ type: "restaurant", provider: "ramiro", booking_code: "RM-55102", start_at: "2027-04-15T20:30", to_place: "ramiro" }],
);

add(
  "13-museum",
  `Order confirmation - Museu Nacional do Azulejo
Order no. 77310045
Visit date: 14/04/2027   Time slot: 10:30
Tickets: 4 x General admission
Address: Rua da Madre de Deus 4, 1900-312 Lisboa
Show this e-mail or the QR code at the entrance.
Total: 32,00 EUR`,
  [{ type: "activity", booking_code: "77310045", start_at: "2027-04-14T10:30", to_place: "azulejo" }],
);

add(
  "14-concert",
  `Ticketmaster - You are in!
The Midnight Owls - Summer Lights Tour
Estadio da Luz, Lisbon
Sat 17 Jul 2027 - Doors 18:00, Show 20:30
Order number: 61-48203/LIS
Section 12, Row K, Seats 14-15
2 tickets - Total EUR 196.00`,
  [{ type: "event", booking_code: "61-48203/LIS", start_at: "2027-07-17T20:30", to_place: "luz" }],
);

add(
  "15-walking-tour",
  `GetYourGuide booking confirmed
Alfama & Mouraria Walking Tour with Fado
Date: Tuesday, 13 April 2027, 17:00
Meeting point: Largo do Chafariz de Dentro, in front of the Fado Museum, Lisbon
Booking reference: GYGX3K92PL
Participants: 4 adults
Price: EUR 108.00`,
  [{ type: "activity", booking_code: "GYGX3K92PL", start_at: "2027-04-13T17:00", to_place: "lisbon" }],
);

add(
  "16-hotel-two-rooms",
  `RESERVATION CONFIRMATION
The Fullerton Bay Hotel Singapore, 80 Collyer Quay, Singapore 049326
Confirmation No: 88231945
Arrival: 22-Oct-2027   Departure: 25-Oct-2027
Rooms: 2 x Bay Room (King), 2 guests per room
Guests: Maya Lopez, Sam Okafor, Leo Martin, Ana Costa
Rate: SGD 690.00 per room per night
Cancellation: free until 48 hours before arrival.`,
  [{ type: "stay", provider: "fullerton", booking_code: "88231945", start_at: "2027-10-22", end_at: "2027-10-25", to_place: "singapore" }],
);

add(
  "17-emirates-connection",
  `Emirates e-ticket receipt
Booking reference (PNR): K9L2MW
Passenger: MR NIKHIL PATEL
EK 501  Mumbai (BOM) 04:30 -> Dubai (DXB) 06:05   Sun 05 Sep 2027  Economy  Seat 33A
EK 001  Dubai (DXB) 07:45 -> London Heathrow (LHR) 12:15   Sun 05 Sep 2027  Economy  Seat 41K
Baggage: 2 pieces
Total fare INR 58,430`,
  [
    { type: "flight", provider: "emirates", booking_code: "K9L2MW", start_at: "2027-09-05T04:30", end_at: "2027-09-05T06:05", from_place: "bom", to_place: "dxb" },
    { type: "flight", provider: "emirates", booking_code: "K9L2MW", start_at: "2027-09-05T07:45", end_at: "2027-09-05T12:15", from_place: "dxb", to_place: "lhr" },
  ],
);

add(
  "18-not-travel",
  `CITY POWER & LIGHT - Monthly statement
Account number: 4400-1823-77
Billing period: 01 Oct 2026 - 31 Oct 2026
Electricity usage: 312 kWh
Amount due: $84.17 by 21 Nov 2026
Thank you for paying on time.`,
  [],
);

add(
  "19-ryokan-yen",
  `Booking confirmation - Rakuten Travel
Hotel: Hoshinoya Kyoto, Arashiyama, Kyoto
Reservation No.: RY202703-55181
Check-in: 2027/03/29 15:00   Check-out: 2027/03/31 12:00 (2 nights)
Plan: Kaiseki dinner and breakfast included
Guests: 2
Total: 248,000 JPY (tax incl.)`,
  [{ type: "stay", provider: "hoshinoya", booking_code: "RY202703-55181", start_at: "2027-03-29T15:00", end_at: "2027-03-31T12:00", to_place: "kyoto", currency: "JPY" }],
);

add(
  "20-train-no-year",
  `Trenitalia - Your ticket
PNR: XRT9KL
Frecciarossa 9541
Sat 14 Jun  Firenze S. M. Novella 09:15 -> Roma Termini 10:51
Coach 5, seat 8B
Passenger: Maya Lopez
Amount paid: 39,90 EUR`,
  [{ type: "train", booking_code: "XRT9KL", start_at: "2027-06-14T09:15", end_at: "2027-06-14T10:51", from_place: "firenze", to_place: "roma" }],
  { name: "Italy summer", start_date: "2027-06-12", end_date: "2027-06-20", destinations: ["Florence", "Rome"] },
);

for (const f of F) {
  fs.writeFileSync(`${dir}/${f.name}.txt`, f.text + "\n");
  fs.writeFileSync(
    `${dir}/${f.name}.expected.json`,
    JSON.stringify({ is_travel_document: f.bookings.length > 0, trip: f.trip, bookings: f.bookings }, null, 2) + "\n",
  );
}
console.log("fixtures:", F.length);
