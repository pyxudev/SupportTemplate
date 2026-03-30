import { NextResponse } from "next/server";

export async function POST() {
  const payload = {
    language: "sqlserver",
    files: [{ name: "queries.sql", content: "SELECT NEWID();" }],
  };

  try {
    const res = await fetch(
      "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
      {
        method:  "POST",
        headers: {
          "Content-Type":    "application/json",
          "x-rapidapi-key":  process.env.RAPIDAPI_KEY ?? "",
          "x-rapidapi-host": "onecompiler-apis.p.rapidapi.com",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { message: "Failed to generate Session ID" },
        { status: 500 }
      );
    }

    const json     = await res.json();
    const SessionId = (json.stdout as string | undefined)
      ?.replace(/\n/g, "")
      .replace(/------------------------------------/g, "")
      .replace(/\s/g, "");

    return NextResponse.json({ SessionId });
  } catch (error) {
    console.error("[generateSessionId]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
