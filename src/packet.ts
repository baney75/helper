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
        "License, work ID, health card, or birth certificate. They may not demand one specific ID.",
    },
    {
      id: "ssn",
      title: "Social Security numbers for applicants",
      detail:
        "The number can be enough. People not applying do not have to give an SSN.",
    },
    {
      id: "income",
      title: "Proof of income",
      detail: "Pay stubs, or award letters for Social Security, VA, or a pension.",
    },
    {
      id: "rent",
      title: "Rent or mortgage",
      detail: "Lease, rent receipt, or mortgage statement.",
    },
    {
      id: "utils",
      title: "Utility bills",
      detail: "Electric, gas, water, or phone. Some states use a standard allowance.",
    },
    {
      id: "home",
      title: "Where you live, if they ask",
      detail: "Often on your ID, lease, or a bill. No address should not stop you.",
    },
  ];
  if (opts.age60Plus) {
    items.push({
      id: "medical",
      title: "Medical bills if you are 60 or older or disabled",
      detail: "Costs over $35 a month that insurance does not pay.",
    });
  }
  items.push({
    id: "immigration",
    title: "Immigration papers, only if a non-citizen is applying",
    detail: "U.S. citizens do not need these.",
  });
  return items;
}
