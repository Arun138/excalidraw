import { ChatRoom } from "../../component/ChatRoom";
import React from "react";

export default function Room({ params }: { params: { roomId: string } }) {
  const resolvedParams = React.use(params);
  const roomId = resolvedParams.slug;

  return <ChatRoom roomId={roomId} />;
}
