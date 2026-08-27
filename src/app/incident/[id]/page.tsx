import IncidentDetailClient from "./IncidentDetailClient";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

export default function IncidentDetailPage({ params }: { params: { id: string } }) {
  return <IncidentDetailClient id={params.id} />;
}
