import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard-forex"); // Or "/stocks"
}