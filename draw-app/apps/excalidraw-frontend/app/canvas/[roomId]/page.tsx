import { RoomCanvas } from "@/app/components/RoomCanvas";

export default async function CanvasPage({
  params,
}: {
  params: { roomId: string };
}) {
  const roomId = (await params).roomId; // when we need to use params, we need to await it in a async function and this has to be SSR. So we can't use "use client" here. If we need "use client", we make another component (like we used <RoomCanvas /> here) and make it CSR.

  return <RoomCanvas roomId={roomId} />;
}
