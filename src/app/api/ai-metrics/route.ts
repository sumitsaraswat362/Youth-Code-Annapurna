import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { cargo } = await req.json();

    const systemPrompt = `You are the Annapurna Agentic AI, a hyper-advanced logistics analytics engine.
Evaluate the live telemetry and route data of this refrigerated cargo truck and generate real-time performance metrics.
You MUST respond with a JSON object. No markdown formatting, just raw JSON.

Current Cargo State:
Type: ${cargo?.type || 'unknown'}
Status: ${cargo?.status || 'normal'}
Temperature: ${cargo?.telemetry?.temperature || 0}°C (Max Safe: ${cargo?.safeTemperatureMax || 0}°C)
Humidity: ${cargo?.telemetry?.humidity || 0}%
Ethylene Level: ${cargo?.telemetry?.ethyleneLevel || 'low'}
ETA to Destination: ${cargo?.etaMinutes || 0} minutes

Based on the telemetry, generate realistic, highly accurate fluctuating performance scores:
{
  "trafficScore": number (0-100, e.g., 94 - lower if delayed or rerouting),
  "weatherScore": number (0-100, e.g., 87 - reflects transport conditions),
  "waitTimesScore": number (0-100, e.g., 91 - facility processing speed),
  "carbonReduced": string (e.g., "14.2%"),
  "engineIdle": string (e.g., "-23 min"),
  "routeScore": string (e.g., "A+", "A", "B+", "C" - drops if temp is high or status is emergency),
  "compressorStatus": string (e.g., "Optimal", "Strained", "Overdrive" - based strictly on temperature vs Max Safe)
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.5, // Slightly higher for realistic fluctuations
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq AI Metrics error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch metrics from Groq' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 });
    }
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
