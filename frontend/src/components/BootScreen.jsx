import { useEffect, useState } from "react";
import { getBootStatus } from "../services/data.service";
import "../styles/components/boot-screen.css";

const STAGES = ["hugin", "ollama", "ravendb", "warmup"];

export default function BootScreen() {
  const [status, setStatus] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return undefined;
    const controller = new AbortController();
    let timer;
    let delay = 1000;
    const poll = async () => {
      try {
        const next = await getBootStatus(controller.signal);
        setStatus(next);
        delay = 1000;
        if (next.ready) timer = setTimeout(() => setDismissed(true), 250);
        else timer = setTimeout(poll, delay);
      } catch {
        if (controller.signal.aborted) return;
        delay = Math.min(delay * 2, 5000);
        timer = setTimeout(poll, delay);
      }
    };
    poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [dismissed]);

  if (dismissed || !status || status.ready) return null;
  return (
    <div className="boot-screen" role="status" aria-live="polite">
      <div className="boot-screen-card">
        <h1>Hugin is starting</h1>
        <ul>
          {STAGES.map((name) => {
            const stage = status.stages?.[name] || { status: "pending" };
            return (
              <li key={name}>
                <strong>{name}</strong>
                <span>{stage.status}</span>
                {stage.detail && <small>{stage.detail}</small>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
