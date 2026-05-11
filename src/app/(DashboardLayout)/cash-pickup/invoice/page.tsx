import { redirect } from "next/navigation";

/** Old path; menu uses `/invoice/cash-pickup`. */
export default function LegacyCashPickupInvoiceRoute() {
  redirect("/invoice/cash-pickup");
}
