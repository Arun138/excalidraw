import { useEffect, useState } from "react";
import { WS_URL } from "../config";

export function useSocket(){
    const [loading, setLoading] = useState(true)
    const [socket, setSocket] = useState<WebSocket>()

    useEffect(() => {
      const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OGRiYzM3NDcxODg2Y2ZiYmJiODkzMyIsImlhdCI6MTc3MTEzODg4OX0.ie2lHn8nVOFRVt_BFXHpj5MSt-6rGKjw1vYamofi1W4`)
      ws.onopen = () => {
        setLoading(false)
        setSocket(ws)
      }
    }, [])

    return {
        socket,loading
    }
    
}