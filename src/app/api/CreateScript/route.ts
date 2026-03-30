import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const { clientBaseUrl, description, TicketId, SessionId, outputFile, sqlScript } =
    await req.json();

  try {
    /* Load template */
    const templatePath = path.join(process.cwd(), "static", "template.txt");
    const tempCont     = fs.readFileSync(templatePath, "utf-8");

    /* Split and reassemble */
    const [head, tail]   = tempCont.split("-- mid");
    const [head1, head2] = head.split("-- Set @Description, @TicketId, @SessionId");

    const headParams = `
SET @ClientBaseURL = '${clientBaseUrl}'
SET @Description  = '${description}'
SET @TicketId     = '${TicketId}'
SET @SessionId    = '${SessionId}'
`;

    const script = head1 + headParams + head2 + sqlScript + tail;

    /* Optionally persist to disk */
    const outputPath = path.join(
      process.cwd(),
      "static",
      `${outputFile}.sql`
    );
    fs.writeFileSync(outputPath, script, "utf-8");

    return NextResponse.json({ Script: script }, { status: 200 });
  } catch (error) {
    console.error("[CreateScript]", error);
    return NextResponse.json(
      { message: "Error generating script", error: String(error) },
      { status: 500 }
    );
  }
}
