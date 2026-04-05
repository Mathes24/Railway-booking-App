async function getRecommendations(db, userId, liveStatuses) {
    if (!db) return [];

    // 1. Fetch User History
    const userTickets = await db.all(`
        SELECT t.*, tr.price, tr.time, tr.destination
        FROM Tickets t
        JOIN Trains tr ON t.trainId = tr.id
        WHERE t.userId = ?
    `, [userId]);

    // 2. Fetch all trains
    const allTrains = await db.all('SELECT * FROM Trains');
    
    for (let t of allTrains) {
        const booked = await db.get('SELECT COUNT(*) as c FROM BookedSeats WHERE trainId = ?', [t.id]);
        t.seatsAvailable = t.totalSeats - booked.c;
        t.liveStatus = liveStatuses[t.id] || { delay: 0, message: 'On Time' };
        t.aiScore = 0;
        t.aiReasons = [];
    }

    if (userTickets.length === 0) {
        // Cold start - No history
        return allTrains
            .filter(t => t.seatsAvailable > 0)
            .sort((a, b) => a.price - b.price)
            .slice(0, 3)
            .map(t => ({ ...t, aiScore: 1, aiReasons: ['Popular Budget Pick'] }));
    }

    // 3. Build User Pattern Profile
    let totalSpendPerSeat = 0;
    let amPreferences = 0;
    let pmPreferences = 0;
    const destCounts = {};

    userTickets.forEach(ticket => {
        if (ticket.seatsBooked > 0) {
            totalSpendPerSeat += (ticket.totalPrice / ticket.seatsBooked);
        }
        
        if (ticket.time && ticket.time.toLowerCase().includes('am')) {
            amPreferences++;
        } else {
            pmPreferences++;
        }

        if (ticket.destination) {
            destCounts[ticket.destination] = (destCounts[ticket.destination] || 0) + 1;
        }
    });

    const avgPricePreference = totalSpendPerSeat / userTickets.length || 0;
    const preferredTimeWindow = amPreferences >= pmPreferences ? 'AM' : 'PM';
    const favoriteDests = Object.keys(destCounts).sort((a,b) => destCounts[b] - destCounts[a]).slice(0, 2); // top 2

    // 4. Score all available trains
    allTrains.forEach(t => {
        if (t.seatsAvailable <= 0) return;

        // Origin-Destination Match priority (+5)
        if (favoriteDests.includes(t.destination)) {
            t.aiScore += 5;
            t.aiReasons.push('Frequent Route');
        }

        // Time Match (+3)
        if (t.time && t.time.toLowerCase().includes(preferredTimeWindow.toLowerCase())) {
            t.aiScore += 3;
            t.aiReasons.push(`${preferredTimeWindow} Travel Preferred`);
        }

        // Price Match (+3)
        const priceDiffPercentage = Math.abs(t.price - avgPricePreference) / (avgPricePreference || 1);
        if (priceDiffPercentage <= 0.3) {
            t.aiScore += 3;
            t.aiReasons.push('Matches Typical Price');
        } else if (t.price < avgPricePreference) {
            t.aiScore += 2;
            t.aiReasons.push('Cheaper Alternative');
        }

        // Real-Time Punctuality (+2)
        if (t.liveStatus && t.liveStatus.delay === 0) {
            t.aiScore += 2;
            t.aiReasons.push('Consistently On-Time');
        }
    });

    // 5. Select Top Choices
    const sortedTrains = allTrains
        .filter(t => t.seatsAvailable > 0 && t.aiScore > 0)
        .sort((a, b) => b.aiScore - a.aiScore);

    if (sortedTrains.length === 0) {
        return allTrains
            .filter(t => t.seatsAvailable > 0)
            .sort((a, b) => a.price - b.price)
            .slice(0, 3)
            .map(t => ({ ...t, aiScore: 1, aiReasons: ['Generic Match'] }));
    }

    // Limit reasons to 2 for UI cleanliness
    return sortedTrains.slice(0, 3).map(t => {
        t.aiReasons = t.aiReasons.slice(0, 2);
        return t;
    });
}

module.exports = { getRecommendations };
