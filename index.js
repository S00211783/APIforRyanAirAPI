import express from 'express';
import cors from 'cors';
import { fares, flights } from '@2bad/ryanair';
import axios from 'axios';

const app = express();
const PORT = 3000;
// Enable CORS for frontend requests
app.use(cors());

// Endpoint to get cheapest fares
app.get('/api/fares', async (req, res) => {
  const { origin, destination, date } = req.query;

  try {
    const cheapestFares = await fares.getCheapestPerDay(origin, destination, date);
    res.json(cheapestFares);
    console.log(cheapestFares);
  } catch (error) {
    console.error('Error fetching fares:', error);
    res.status(500).json({ error: 'Failed to fetch fares' });
  }
});

// Endpoint to get cheapest fares
app.get('/api/fares/getCheapestRoundTrip', async (req, res) => {
    const { origin, destination, date, endDate } = req.query;
  
    try {
        const trips = await fares.findCheapestRoundTrip(origin, destination, date, endDate, 'EUR', 10)
      res.json(trips);
      console.log(trips);
    } catch (error) {
      console.error('Error fetching fares:', error);
      res.status(500).json({ error: 'Failed to fetch fares' });
    }
  });

  app.get('/api/fares/getAvailable', async (req, res) => {
    const { Origin, Destination, ADT, CHD, DateIn, DateOut, Disc, INF, TEEN, promoCode, IncludeConnectingFlights, FlexDaysBeforeOut, FlexDaysOut, FlexDaysBeforeIn, FlexDaysIn, RoundTrip } = req.query;

    try {
        // Initialize options with default values
        const options = {};

        // Only add properties to options if they are provided (not null or empty), and ensure they are strings
        if (ADT !== undefined) options.ADT = String(ADT || 1);
        if (CHD !== undefined) options.CHD = String(CHD || 0);
        if (DateIn !== undefined) options.DateIn = String(DateIn || '');
        if (DateOut !== undefined) options.DateOut = String(DateOut || (endDate !== undefined ? endDate : ''));
        if (Destination !== undefined) options.Destination = String(Destination);
        if (Disc !== undefined) options.Disc = String(Disc || '0');
        if (INF !== undefined) options.INF = String(INF || 0);
        if (Origin !== undefined) options.Origin = String(Origin);
        if (TEEN !== undefined) options.TEEN = String(TEEN || 0);
        if (promoCode !== undefined) options.promoCode = String(promoCode || '');
        if (IncludeConnectingFlights !== undefined) options.IncludeConnectingFlights = String(IncludeConnectingFlights || 'false');
        if (FlexDaysBeforeOut !== undefined) options.FlexDaysBeforeOut = String(FlexDaysBeforeOut || 2);
        if (FlexDaysOut !== undefined) options.FlexDaysOut = String(FlexDaysOut || 2);
        if (FlexDaysBeforeIn !== undefined) options.FlexDaysBeforeIn = String(FlexDaysBeforeIn || 2);
        if (FlexDaysIn !== undefined) options.FlexDaysIn = String(FlexDaysIn || 2);
        if (RoundTrip !== undefined) options.RoundTrip = String(RoundTrip || 'false');

        const trips = await flights.getAvailable(options);
        res.json(trips);
        console.log(trips);
    } catch (error) {
        console.error('Error fetching fares:', error);
        res.status(500).json({ error: 'Failed to fetch fares' });
    }
});

app.get('/api/ryanair/fareOptions', async (req, res) => {
    const { outboundFlightKey, outboundFareKey, inboundFlightKey, inboundFareKey, ADT, CHD, INF, TEEN } = req.query;

    // Build the query string dynamically
    const queryParams = new URLSearchParams();

    if (outboundFlightKey) queryParams.append('OutboundFlightKey', outboundFlightKey);
    if (outboundFareKey) queryParams.append('OutboundFareKey', outboundFareKey);
    if (inboundFlightKey) queryParams.append('InboundFlightKey', inboundFlightKey);
    if (inboundFareKey) queryParams.append('InboundFareKey', inboundFareKey);
    if (ADT) queryParams.append('AdultsCount', String(ADT));
    if (CHD) queryParams.append('ChildrenCount', String(CHD));
    if (INF) queryParams.append('InfantCount', String(INF));
    if (TEEN) queryParams.append('TeensCount', String(TEEN));

    // Prepare the final API URL
    const url = `https://www.ryanair.com/api/booking/v5/en-ie/FareOptions?${queryParams.toString()}`;

    try {
        // Make the API request to Ryanair
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching fare options:', error);
        res.status(500).json({ error: 'Failed to fetch fare options' });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
