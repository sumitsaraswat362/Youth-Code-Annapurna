import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { cargo, spoilageMinutes } = await req.json();

    const systemPrompt = `You are the Annapurna Agentic AI, an autonomous logistics dispatcher.
Your goal is to evaluate live telemetry from refrigerated trucks and decide whether to continue the route or trigger an emergency reroute/liquidation.
You MUST respond with a JSON object. No markdown formatting, just raw JSON.

Output format:
{
  "recommendation": "continue" | "emergency_sell",
  "reasoning": "Detailed 2-3 sentence explanation with emojis of why this decision was made. Include temperature and spoilage time.",
  "confidence": 0.0 to 1.0
}

Current Cargo:
Type: ${cargo.type}
Temperature: ${cargo.telemetry.temperature}°C (Max Safe: ${cargo.safeTemperatureMax}°C)
Humidity: ${cargo.telemetry.humidity}%
Ethylene: ${cargo.telemetry.ethyleneLevel}
ETA to Destination: ${cargo.etaMinutes} minutes
Estimated Spoilage In: ${spoilageMinutes} minutes

Rules:
1. If Temperature <= Max Safe: recommendation is "continue".
2. If Temperature > Max Safe but Spoilage In > ETA to Destination: recommendation is "continue" with a warning.
3. If Temperature > Max Safe and Spoilage In <= ETA to Destination: recommendation is "emergency_sell".
`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.2,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch from Groq' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON response from Groq' }, { status: 500 });
    }
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
