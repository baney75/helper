export type PacketItem = {
  id: string;
  title: string;
  detail: string;
};

export function packetItems(opts: { age60Plus: boolean }): PacketItem[] {
  const items: PacketItem[] = [
    {
      id: "id",
      title: "Photo or other ID",
      detail:
        "Driver’s license, work or school ID, health card, voter card, wage stub, or birth certificate. The office may not demand one specific ID.",
    },
    {
      id: "ssn",
      title: "Social Security numbers for people who are applying",
      detail:
        "The card helps. The number can be enough. People who are not applying do not have to give an SSN or immigration papers.",
    },
    {
      id: "income",
      title: "Proof of income",
      detail:
        "Latest pay stubs or an employer statement. Award letters for Social Security, VA, unemployment, or a pension.",
    },
    {
      id: "rent",
      title: "Rent or mortgage",
      detail: "Lease, rent receipt, or mortgage statement.",
    },
    {
      id: "utils",
      title: "Utility bills",
      detail:
        "Electric, gas, oil, water, sewer, garbage, or phone. Some states use a standard allowance instead of actual bills.",
    },
    {
      id: "home",
      title: "Where you live, if they ask",
      detail:
        "Often covered by ID, a lease, or a bill. No fixed address should not stop the application.",
    },
  ];
  if (opts.age60Plus) {
    items.push({
      id: "medical",
      title: "Medical bills if you are 60 or older or disabled",
      detail:
        "Costs over $35 a month that insurance does not pay, plus any reimbursement papers.",
    });
  }
  items.push({
    id: "immigration",
    title: "Immigration papers, only if a non-citizen is applying",
    detail:
      "U.S. citizens do not need these. A household can continue without a member who does not want USCIS contacted.",
  });
  return items;
}
