import { redirect } from "next/navigation";

// OPERIQ now lives under the unified project route. Keep /operiq working.
export default function OperiqRedirect() {
  redirect("/work/operiq");
}
