import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import BootScreen from "./BootScreen";

const { getBootStatus } = vi.hoisted(() => ({ getBootStatus: vi.fn() }));
vi.mock("../services/data.service", () => ({ getBootStatus }));

afterEach(() => {
  cleanup();
  getBootStatus.mockReset();
  vi.useRealTimers();
});

describe("BootScreen", () => {
  it("renders read-only stage state", async () => {
    getBootStatus.mockResolvedValue({
      ready: false,
      stages: {
        hugin: { status: "ready" },
        ollama: { status: "loading", detail: "model not resident" },
        ravendb: { status: "ready" },
        warmup: { status: "pending" },
      },
    });
    render(<BootScreen />);
    expect(await screen.findByText("Hugin is starting")).toBeTruthy();
    expect(screen.getByText("model not resident")).toBeTruthy();
    expect(screen.queryByText(/heal/i)).toBeNull();
  });

  it("aborts polling when unmounted", () => {
    getBootStatus.mockImplementation(() => new Promise(() => {}));
    const view = render(<BootScreen />);
    const signal = getBootStatus.mock.calls[0][0];
    expect(signal.aborted).toBe(false);
    view.unmount();
    expect(signal.aborted).toBe(true);
  });
});
