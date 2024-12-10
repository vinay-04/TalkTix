import fs from "node:fs";
import dotenv from "dotenv";
import { transporter } from "../config/config";

dotenv.config({ path: ".env.local" });

function createICalFile(name: string, startTime: string, endTime: string) {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TalkTix//Calendar//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${new Date().getTime()}@talktix.com
SUMMARY:${name}
DTSTART:${startTime}
DTEND:${endTime}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT30M
DESCRIPTION:Event Reminder
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

  const filePath = `/tmp/event_${Date.now()}.ics`;
  fs.writeFileSync(filePath, icsContent);
  return filePath;
}

async function sendCalendarInvite(
  name: string,
  userEmail: string,
  startTime: string,
  endTime: string,
): Promise<void> {
  try {
    const icsFilePath = createICalFile(name, startTime, endTime);

    const defaultSubject = `Calendar Invite: ${name}`;
    const defaultMessage =
      `You have been invited to ${name}\n\n` +
      `Start Time: ${new Date(startTime).toLocaleString()}\n` +
      `End Time: ${new Date(endTime).toLocaleString()}`;

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: userEmail,
      subject: defaultSubject,
      text: defaultMessage,
      attachments: [
        {
          filename: "event.ics",
          path: icsFilePath,
          contentType: "text/calendar; method=REQUEST",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    fs.unlinkSync(icsFilePath);

    console.log("Calendar invite sent successfully");
  } catch (error) {
    console.error("Error sending calendar invite:", error);
    throw error;
  }
}

export { sendCalendarInvite };
