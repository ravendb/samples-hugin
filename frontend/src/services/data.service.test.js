import { describe, expect, it, vi } from "vitest";
import { createDataService } from "./data.service";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("progressive search", () => {
  it("always resolves FTS before starting optional AI", async () => {
    const fts = deferred();
    const ai = deferred();
    const events = [];
    const client = {
      get: vi.fn()
        .mockReturnValueOnce(fts.promise)
        .mockReturnValueOnce(ai.promise),
    };
    const service = createDataService(client, "/api/");

    service.queryQuestionsProgressive(
      { q: "wifi", aiEnabled: true },
      {
        onNormal: () => events.push("normal"),
        onAiStart: () => events.push("ai-start"),
        onAi: () => events.push("ai"),
      },
    );
    expect(client.get).toHaveBeenCalledTimes(1);

    fts.resolve({ data: { data: { results: [] } } });
    await flush();
    expect(events).toEqual(["normal", "ai-start"]);
    expect(client.get).toHaveBeenCalledTimes(2);
    expect(client.get.mock.calls[1][1].params.mode).toBe("ai");

    ai.resolve({ data: { data: { results: [] } } });
    await flush();
    expect(events).toEqual(["normal", "ai-start", "ai"]);
  });

  it("does not issue AI when the toggle is disabled", async () => {
    const client = {
      get: vi.fn().mockResolvedValue({ data: { data: { results: [] } } }),
    };
    const service = createDataService(client, "/api/");
    service.queryQuestionsProgressive({ q: "wifi", aiEnabled: false });
    await flush();
    expect(client.get).toHaveBeenCalledTimes(1);
  });

  it("one abort signal cancels whichever leg is active", async () => {
    const fts = deferred();
    const client = { get: vi.fn().mockReturnValue(fts.promise) };
    const onError = vi.fn();
    const service = createDataService(client, "/api/");
    const request = service.queryQuestionsProgressive(
      { q: "wifi", aiEnabled: true },
      { onError },
    );
    const signal = client.get.mock.calls[0][1].signal;
    request.abort();
    expect(signal.aborted).toBe(true);
    fts.reject(new DOMException("aborted", "AbortError"));
    await flush();
    expect(onError).not.toHaveBeenCalled();
  });

  it("ignores superseded responses but reports real failures", async () => {
    const onError = vi.fn();
    const superseded = {
      response: { status: 409, data: { superseded: true } },
    };
    const client = { get: vi.fn().mockRejectedValueOnce(superseded) };
    createDataService(client, "/api/").queryQuestionsProgressive(
      { q: "old" },
      { onError },
    );
    await flush();
    expect(onError).not.toHaveBeenCalled();

    client.get.mockRejectedValueOnce({
      response: { status: 503, data: { error: "RavenDB is unavailable" } },
    });
    createDataService(client, "/api/").queryQuestionsProgressive(
      { q: "new" },
      { onError },
    );
    await flush();
    expect(onError).toHaveBeenCalledWith("RavenDB is unavailable");
  });
});
