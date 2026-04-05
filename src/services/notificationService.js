function sendBookingConfirmation(user, train, ticket) {
    const emailBody = `
=============================================
📧 EMAIL DISPATCHED TO: ${user.email}
SUBJECT: Booking Confirmed - ${train.name}
---------------------------------------------
Hello ${user.name},

Your booking on ${train.name} (${train.source} to ${train.destination}) is confirmed!
Date: ${train.date} at ${train.time}
Seats: ${ticket.seatsBooked}
Total Paid: ₹${ticket.totalPrice}
Payment Method: ${ticket.paymentMethod} (TXN: ${ticket.transactionId})

Have a great journey!
- Indian Railways Booking Team
=============================================
`;
    // Cyan color wrapping
    console.log('\x1b[36m%s\x1b[0m', emailBody);

    const smsBody = `
📱 SMS DISPATCHED:
"Confirmed! ${ticket.seatsBooked} seats booked on ${train.name} for ${train.date}. Paid ₹${ticket.totalPrice}. TXN: ${ticket.transactionId}"
`;
    // Yellow color wrapping
    console.log('\x1b[33m%s\x1b[0m', smsBody);
}

function sendDelayAlert(userEmail, train, delayMins) {
    const alertBody = `
=============================================
🚨 URGENT SMS/PUSH ALERT: ${userEmail}
---------------------------------------------
ATTENTION: Your train ${train.name} is currently running late by ${delayMins} minutes.
We apologize for the inconvenience.
=============================================
`;
    // Red color wrapping
    console.log('\x1b[31m%s\x1b[0m', alertBody);
}

function sendRefundAlert(userEmail, ticket, train) {
    const refundBody = `
=============================================
💸 REFUND INITIATED: ${userEmail}
---------------------------------------------
TICKET CANCELLED: ${train.name} (${train.source} -> ${train.destination})
REFUND AMOUNT: ₹${ticket.totalPrice}
Your refund is currently being processed to the original payment method (${ticket.paymentMethod}).
Transaction ID Reference: ${ticket.transactionId}
=============================================
`;
    // Purple/Magenta color wrapping
    console.log('\x1b[35m%s\x1b[0m', refundBody);
}

module.exports = { sendBookingConfirmation, sendDelayAlert, sendRefundAlert };
